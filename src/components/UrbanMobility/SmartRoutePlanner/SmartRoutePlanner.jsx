import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  StandaloneSearchBox
} from '@react-google-maps/api';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './SmartRoutePlanner.css';
import { config } from '../../../config/config';

const containerStyle = { width: '100%', height: '100%' };
const center = { lat: 13.0827, lng: 80.2707 };

const mapOptions = {
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
};

const SmartRoutePlanner = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [triggerRoute, setTriggerRoute] = useState(false);

  // AI suggestion state
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const mapRef = useRef(null);
  const originBoxRef = useRef(null);
  const destBoxRef = useRef(null);
  const navigate = useNavigate();

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleRoute = () => {
    if (!origin || !destination) {
      alert('Please enter both origin and destination');
      return;
    }
    setSelectedRouteIndex(0);
    setTriggerRoute(true);
    setAiSuggestion(null);
    setAiError(null);
  };

  const fitBounds = (result, routeIndex) => {
    if (!mapRef.current || !result?.routes?.length) return;
    const bounds = new window.google.maps.LatLngBounds();
    result.routes[routeIndex].legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        bounds.extend(step.start_location);
        bounds.extend(step.end_location);
      });
    });
    mapRef.current.fitBounds(bounds);
  };

  // Autocomplete Handlers
  const onOriginPlacesChanged = () => {
    const places = originBoxRef.current.getPlaces();
    if (places?.length > 0) {
      setOrigin(places[0].formatted_address || places[0].name);
    }
  };

  const onDestinationPlacesChanged = () => {
    const places = destBoxRef.current.getPlaces();
    if (places?.length > 0) {
      setDestination(places[0].formatted_address || places[0].name);
    }
  };

  // Automatically pick shortest route
  const selectShortestRoute = (routesList) => {
    if (!routesList?.length) return 0;
    let minIndex = 0;
    let minDuration = routesList[0].legs[0].duration.value;
    routesList.forEach((route, idx) => {
      const duration = route.legs[0].duration.value;
      if (duration < minDuration) {
        minDuration = duration;
        minIndex = idx;
      }
    });
    return minIndex;
  };

  // Fetch AI suggestion whenever routes are updated
  useEffect(() => {
    if (!routes.length) return;

    const fetchGemini = async () => {
      setAiLoading(true);
      setAiSuggestion(null);
      setAiError(null);

      const prompt = `You are an expert urban mobility assistant. Given the following route options from "${origin}" to "${destination}", suggest the safest, shortest, and smartest route. Explain your reasoning and provide the estimated time in hours and minutes.\n\n` +
        routes.map((route, idx) => {
          const leg = route.legs[0];
          const distanceKm = (leg.distance.value / 1000).toFixed(2);
          const durationMin = Math.round(leg.duration.value / 60);
          const hours = Math.floor(durationMin / 60);
          const minutes = durationMin % 60;
          let timeStr = '';
          if (hours > 0) timeStr += `${hours} hr${hours > 1 ? 's' : ''} `;
          timeStr += `${minutes} min${minutes !== 1 ? 's' : ''}`;
          return `Route ${idx + 1}: ${route.summary || 'No summary'} | Distance: ${distanceKm} km | Duration: ${timeStr}` +
            (route.warnings?.length ? ` | Warnings: ${route.warnings.join(' ')}` : '');
        }).join('\n') +
        `\n\nRespond in this format:\nRecommended Route: <number> (<summary>)\nEstimated Time: <time>\nWhy: <reasoning>`;

      try {
        const apiKey = config.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: prompt }] }
            ]
          })
        });

        if (!resp.ok) throw new Error(`Gemini API error ${resp.status}: ${await resp.text()}`);

        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";

        setAiSuggestion({
          route: text.match(/Recommended Route: (.+)/i)?.[1]?.trim() || "",
          time: text.match(/Estimated Time: (.+)/i)?.[1]?.trim() || "",
          reason: text.match(/Why:([\s\S]*)/i)?.[1]?.trim() || text
        });
      } catch (err) {
        console.error(err);
        setAiError("Could not get Gemini suggestion.");
      } finally {
        setAiLoading(false);
      }
    };

    fetchGemini();
  }, [routes, origin, destination]);

  return (
    <div className="smart-route-container">
      <button className="back-arroww" onClick={() => navigate(-1)} title="Go Back">
        <FaArrowLeft />
      </button>

      <div className="left-panel">
        <h3>Smart Route Planner</h3>

        {/* Origin Autocomplete */}
        <StandaloneSearchBox
          onLoad={(ref) => (originBoxRef.current = ref)}
          onPlacesChanged={onOriginPlacesChanged}
        >
          <input type="text" placeholder="Enter Your Location" />
        </StandaloneSearchBox>

        {/* Destination Autocomplete */}
        <StandaloneSearchBox
          onLoad={(ref) => (destBoxRef.current = ref)}
          onPlacesChanged={onDestinationPlacesChanged}
        >
          <input type="text" placeholder="Enter Destination" />
        </StandaloneSearchBox>

        <button className="button" onClick={handleRoute}>
          Get Smart Route
        </button>

        {/* AI Suggestion Area */}
        <div className="ai-suggestion-area">
          <h4>AI Route Suggestion</h4>
          {aiLoading && <div>Analyzing best route...</div>}
          {aiError && <div style={{ color: 'red' }}>{aiError}</div>}
            {aiSuggestion && (
              <div>
                <div><b>Route:</b> {aiSuggestion.route ? aiSuggestion.route : 'N/A'}{aiSuggestion.time ? ` (${aiSuggestion.time})` : ''}</div>
                <div style={{marginTop: 2, fontSize: '0.97em'}}><b>Why:</b> {aiSuggestion.reason ? aiSuggestion.reason.split(/\.|\n/).filter(Boolean)[0] : 'No reason provided.'}</div>
              </div>
            )}
          {!aiLoading && !aiError && !aiSuggestion && <div>No suggestion yet.</div>}
        </div>
      </div>

      <div className="right-panel">
        <GoogleMap
          mapContainerClassName="map-container"
          center={center}
          zoom={12}
          onLoad={onMapLoad}
          options={mapOptions}
        >
          {triggerRoute && origin && destination && (
            <DirectionsService
              options={{
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true,
                optimizeWaypoints: true
              }}
              callback={(res) => {
                if (!res) return;
                if (res.status === 'OK') {
                  const shortestIndex = selectShortestRoute(res.routes);
                  setDirections(res);
                  setRoutes(res.routes);
                  setSelectedRouteIndex(shortestIndex);
                  fitBounds(res, shortestIndex);
                  setTriggerRoute(false);
                } else {
                  alert('No route found: ' + res.status);
                }
              }}
            />
          )}

          {directions && (
            <>
              <DirectionsRenderer
                directions={directions}
                routeIndex={selectedRouteIndex}
                options={{
                  polylineOptions: {
                    strokeColor: '#4a90e2',
                    strokeWeight: 6,
                    strokeOpacity: 0.8
                  }
                }}
              />
              <div className="route-options">
                {routes.map((route, idx) => (
                  <button
                    key={idx}
                    className={`route-option ${selectedRouteIndex === idx ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedRouteIndex(idx);
                      fitBounds(directions, idx);
                    }}
                  >
                    Route {idx + 1} ({Math.round(route.legs[0].distance.value / 1000)} km,{' '}
                    {Math.round(route.legs[0].duration.value / 60)} mins)
                  </button>
                ))}
              </div>
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default SmartRoutePlanner;
