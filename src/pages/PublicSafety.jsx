import React, { useState } from 'react';
import './PublicSafety.css';
import { FaArrowLeft, FaExclamationTriangle, FaAmbulance, FaBookOpen, FaPlus, FaMicrophone } from 'react-icons/fa';
import { WiDaySunny } from 'react-icons/wi';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../components/ChatBot';
import { GoogleMap, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { config } from '../config/config';
import disasterCSV from '../../Database/disaster data.csv?raw';

const mockAlerts = [
  { id: 1, type: 'Flood', location: 'Main St', message: 'Flooding reported, avoid area.', time: '2 min ago' },
  { id: 2, type: 'Fire', location: 'Central Park', message: 'Fire emergency, responders on site.', time: '10 min ago' },
  { id: 3, type: 'Accident', location: 'Elm St', message: 'Road accident, traffic slow.', time: '20 min ago' }
];

function parseDisasterCSV(csv) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',');
  const disasters = [];
  let currentType = '';
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row[0]) currentType = row[0];
    if (!currentType) continue;
    if (!disasters.some(d => d.type === currentType)) {
      disasters.push({ type: currentType, before: [], during: [], after: [] });
    }
    const disaster = disasters.find(d => d.type === currentType);
    if (row[1]) disaster.before.push(row[1]);
    if (row[2]) disaster.during.push(row[2]);
    if (row[3]) disaster.after.push(row[3]);
  }
  return disasters;
}

const disasterTips = [
  { stage: 'Before', tips: ['Prepare an emergency kit', 'Know evacuation routes', 'Stay informed via alerts'] },
  { stage: 'During', tips: ['Follow official instructions', 'Stay calm', 'Help others if safe'] },
  { stage: 'After', tips: ['Check for injuries', 'Avoid damaged areas', 'Stay updated'] }
];

const PublicSafety = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('alert');
  const [alerts, setAlerts] = useState(mockAlerts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: '', location: '', message: '' });
  const [route, setRoute] = useState({ from: '', to: '' });
  const [routeResult, setRouteResult] = useState(null);
  const [from, setFrom] = useState("");
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [listening, setListening] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapRef, setMapRef] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [disasterData, setDisasterData] = useState([]);
  const [weatherArea, setWeatherArea] = useState("");
  const [weatherResult, setWeatherResult] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [weatherOpen, setWeatherOpen] = useState(false);

  // Simulate AI-based routing
  const findAndShowNearestHospitalRoute = React.useCallback((locationStr) => {
    if (!locationStr) {
      setRouteResult('Please provide the accident site.');
      setDirections(null);
      setRouteInfo(null);
      return;
    }
    if (!window.google || !window.google.maps || !window.google.maps.places || !window.google.maps.geometry) {
      setRouteResult('Google Maps libraries are not fully loaded yet. Please wait and try again.');
      setDirections(null);
      setRouteInfo(null);
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: locationStr }, async (results, status) => {
      if (status === 'OK' && results[0]) {
        const fromLocation = results[0].geometry.location;
        const latLng = new window.google.maps.LatLng(fromLocation.lat(), fromLocation.lng());
        const map = new window.google.maps.Map(document.createElement('div'));
        const service = new window.google.maps.places.PlacesService(map);
        const allResults = await getAllNearbyHospitals(service, {
          location: latLng,
          radius: 5000,
          type: 'hospital'
        });
        let hospitalList = allResults;
        hospitalList.sort((a, b) => {
          const da = window.google.maps.geometry.spherical.computeDistanceBetween(latLng, a.geometry.location);
          const db = window.google.maps.geometry.spherical.computeDistanceBetween(latLng, b.geometry.location);
          return da - db;
        });
        const nearestHospital = hospitalList[0].geometry.location;
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: latLng,
            destination: nearestHospital,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') {
              setDirections(result);
              setRouteResult(null);
              if (result.routes && result.routes[0] && result.routes[0].legs && result.routes[0].legs[0]) {
                const leg = result.routes[0].legs[0];
                setRouteInfo({
                  distance: leg.distance.text,
                  duration: leg.duration.text
                });
              } else {
                setRouteInfo(null);
              }
              if (result.routes && result.routes[0] && result.routes[0].bounds && mapRef) {
                mapRef.fitBounds(result.routes[0].bounds);
              }
            } else {
              setRouteResult('Could not find a route.');
              setDirections(null);
              setRouteInfo(null);
            }
          }
        );
      } else {
        setRouteResult('Could not find the accident site location.');
        setDirections(null);
        setRouteInfo(null);
      }
    });
  }, [mapRef]);

  const getAllNearbyHospitals = (service, request) => {
    return new Promise((resolve) => {
      let allResults = [];
      function processResults(results, status, pagination) {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          allResults = allResults.concat(results);
          if (pagination && pagination.hasNextPage) {
            setTimeout(() => pagination.nextPage(), 1000);
          } else {
            resolve(allResults);
          }
        } else {
          resolve(allResults);
        }
      }
      service.nearbySearch(request, processResults);
    });
  };

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!form.type || !form.location || !form.message) return;
    setAlerts([
      ...alerts,
      {
        id: alerts.length + 1,
        type: form.type,
        location: form.location,
        message: form.message,
        time: 'Just now'
      }
    ]);
    setForm({ type: '', location: '', message: '' });
    setShowForm(false);
  };

  // Voice assistant for 'from' input
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript.trim();
      setFrom(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  async function fetchWeather(area) {
    setWeatherLoading(true);
    setWeatherError("");
    setWeatherResult(null);
    try {
      // Use OpenWeatherMap API (or similar, replace with your API key if needed)
      const apiKey = config.WEATHER_API_KEY;
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(area)}&appid=${apiKey}&units=metric`);
      if (!response.ok) throw new Error('Weather not found');
      const data = await response.json();
      setWeatherResult({
        temp: data.main.temp,
        desc: data.weather[0].description,
        humidity: data.main.humidity,
        wind: data.wind.speed,
        city: data.name
      });
    } catch (err) {
      setWeatherError("Could not fetch weather for this area.");
    } finally {
      setWeatherLoading(false);
    }
  }

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setCurrentLocation(null);
        }
      );
    }
  }, []);

  React.useEffect(() => {
    setDisasterData(parseDisasterCSV(disasterCSV));
  }, []);

  // --- Add handleRoute definition (fix ReferenceError) ---
  const handleRoute = (e) => {
    if (e) e.preventDefault();
    findAndShowNearestHospitalRoute(from);
  };

  return (
    <div className="community-alert-outer">
      <button className="back-arrow" onClick={() => navigate(-1)} title="Go Back">
        <FaArrowLeft />
      </button>
      <div className="community-alert-container">
        <div className="tab-header">
          <button className={`tab-btn${tab==='alert' ? ' active' : ''}`} onClick={()=>setTab('alert')}><FaExclamationTriangle/> Community Alerts</button>
          <button className={`tab-btn${tab==='route' ? ' active' : ''}`} onClick={()=>setTab('route')}><FaAmbulance/> Emergency Routing</button>
          <button className={`tab-btn${tab==='tips' ? ' active' : ''}`} onClick={()=>setTab('tips')}><FaBookOpen/> Disaster Planner</button>
        </div>
        {tab === 'alert' && (
          <div style={{ position: 'relative' }}>
            <h3 style={{ margin: 0, textAlign: 'center' }}>Community Alert System</h3>
            <br></br>
            {/* Weather Icon floating at left bottom */}
            <span
              className='weather-icon'
              title="Show Weather Status"
              onClick={e => { e.stopPropagation(); setWeatherOpen(w => !w); }}
            >
              <WiDaySunny />
            </span>
            {weatherOpen && (
              <div className="weather-status-card">
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#0077ff' }}>Weather Status</div>
                <form onSubmit={e => { e.preventDefault(); fetchWeather(weatherArea); }} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    placeholder="Enter area/city"
                    value={weatherArea}
                    onChange={e => setWeatherArea(e.target.value)}
                    style={{ flex: 1, padding: '0.4rem 0.7rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }}
                  />
                  <button type="submit" style={{ padding: '0.4rem 0.9rem', borderRadius: 10, background: '#0077ff', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginRight: '30px' }}>Show</button>
                </form>
                {weatherLoading && <div>Loading...</div>}
                {weatherError && <div style={{ color: '#ef4444' }}>{weatherError}</div>}
                {weatherResult && (
                  <div style={{ marginTop: 8 }}>
                    <div><strong>Location:</strong> {weatherResult.city}</div>
                    <div><strong>Temperature:</strong> {weatherResult.temp}°C</div>
                    <div><strong>Condition:</strong> {weatherResult.desc}</div>
                    <div><strong>Humidity:</strong> {weatherResult.humidity}%</div>
                    <div><strong>Wind:</strong> {weatherResult.wind} m/s</div>
                  </div>
                )}
              </div>
            )}
            {/* Add Alert Button */}
            {!showForm && (
              <button className="alert-add-btn" onClick={() => setShowForm(true)} style={{ margin: '1rem 0', zIndex: 10, position: 'relative' }}>
                <FaPlus style={{ marginRight: 8 }} /> Add Alert
              </button>
            )}
            {showForm && (
              <form className="alert-form" onSubmit={e => { handleAddAlert(e); alert('Disaster alert added to Buddy Community'); }} style={{ zIndex: 20, position: 'relative', background: 'rgba(255,255,255,0.98)', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '0.5rem 0.5rem 0.5rem 0.5rem', marginBottom: 12 }}>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                  <option value="">Type</option>
                  <option value="Flood">Flood</option>
                  <option value="Fire">Fire</option>
                  <option value="Accident">Accident</option>
                </select>
                <input type="text" placeholder="Area Name" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                <input type="text" placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                <button type="submit" className="alert-submit-btn">Submit</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: 8, background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </form>
            )}
            {/* Postcard style for alerts */}
            <div className="alert-postcard-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-postcard alert-${alert.type.toLowerCase()}`}>
                  <div className="alert-postcard-type">{alert.type}</div>
                  <div className="alert-postcard-location">{alert.location}</div>
                  <div className="alert-postcard-message">{alert.message}</div>
                  <div className="alert-postcard-time">{alert.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'route' && (
          <>
            <h3>Emergency Route to Nearest Hospital</h3>
            <form className="route-form" onSubmit={handleRoute}>
              <div className='route-input-container'>
                <Autocomplete
                  onLoad={ac => setAutocomplete(ac)}
                  onPlaceChanged={() => {
                    if (autocomplete) {
                      const place = autocomplete.getPlace();
                      let loc = '';
                      if (place && place.formatted_address) {
                        loc = place.formatted_address;
                      } else if (place && place.name) {
                        loc = place.name;
                      }
                      setFrom(loc);
                      if (loc) findAndShowNearestHospitalRoute(loc);
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder="From (e.g. Accident Site)"
                    value={from}
                    onChange={e => {
                      setFrom(e.target.value);
                    }}
                    className='route-input'
                  />
                </Autocomplete>
                <button
                  type="button"
                  className={`voice-btn${listening ? ' listening' : ''}`}
                  onClick={handleVoiceInput}
                  title="Speak location"
                  aria-label="Voice input for from"
                >
                  <FaMicrophone />
                </button>
              </div>
              <button type="submit" className="route-submit-btn">Show Route to Nearest Hospital</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
              <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => setIsMaximized(m => !m)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 2,
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    padding: '0.3rem 0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  title={isMaximized ? 'Minimize Map' : 'Maximize Map'}
                >
                  {isMaximized ? '🗕' : '🗖'}
                </button>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: isMaximized ? '70vh' : '400px' }}
                  center={mapCenter || (directions ? undefined : (currentLocation || { lat: 28.6139, lng: 77.2090 }))}
                  zoom={directions ? undefined : (currentLocation ? 14 : 12)}
                  onLoad={map => { setMapLoaded(true); setMapRef(map); }}
                >
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              </div>
              {routeInfo && (
                <div style={{
                  minWidth: 220,
                  marginLeft: 24,
                  marginTop: 0,
                  alignSelf: 'flex-start',
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 8,
                  padding: '0.7rem 1.2rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.7rem',
                  position: 'sticky',
                  top: 0,
                  right: 0
                }}>
                  <span><strong>Distance:</strong> {routeInfo.distance}</span>
                  <span><strong>Estimated Time:</strong> {routeInfo.duration}</span>
                </div>
              )}
            </div>
          </>
        )}
        {tab === 'tips' && (
          <>
            <h3>Disaster Preparedness Planner</h3>
            <div className="tips-list" style={{ maxHeight: '60vh', overflowY: 'auto', flexWrap: 'wrap', gap: '2rem' }}>
              {disasterData.map((dis, idx) => (
                <div key={dis.type} className="tips-card" style={{ minWidth: 260, maxWidth: 320, maxHeight: 420, overflowY: 'auto', marginBottom: 16 }}>
                  <div className="tips-stage" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0077ff', marginBottom: 8 }}>{dis.type}</div>
                  <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>Before</div>
                  <ul>{dis.before.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  <div style={{ fontWeight: 600, color: '#f97316', margin: '8px 0 4px 0' }}>During</div>
                  <ul>{dis.during.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  <div style={{ fontWeight: 600, color: '#22c55e', margin: '8px 0 4px 0' }}>After</div>
                  <ul>{dis.after.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <ChatBot></ChatBot>
    </div>
  );
};

export default PublicSafety;