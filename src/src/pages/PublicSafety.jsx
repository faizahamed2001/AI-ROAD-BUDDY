import React, { useState } from 'react';
import './PublicSafety.css';
import { FaArrowLeft, FaExclamationTriangle, FaAmbulance, FaBookOpen, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../components/ChatBot';

const mockAlerts = [
  { id: 1, type: 'Flood', location: 'Main St', message: 'Flooding reported, avoid area.', time: '2 min ago' },
  { id: 2, type: 'Fire', location: 'Central Park', message: 'Fire emergency, responders on site.', time: '10 min ago' },
  { id: 3, type: 'Accident', location: 'Elm St', message: 'Road accident, traffic slow.', time: '20 min ago' }
];

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

  // Simulate AI-based routing
  const handleRoute = (e) => {
    e.preventDefault();
    if (!route.from || !route.to) return;
    setRouteResult(`Fastest route from ${route.to} to ${route.from}: 12 min via Main St & Central Ave (live traffic optimized)`);
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
          <>
            <h3>Community Alert System</h3>
            <button className="alert-add-btn" onClick={() => setShowForm(!showForm)}>
              <FaPlus /> Add Alert
            </button>
            {showForm && (
              <form className="alert-form" onSubmit={handleAddAlert}>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                  <option value="">Type</option>
                  <option value="Flood">Flood</option>
                  <option value="Fire">Fire</option>
                  <option value="Accident">Accident</option>
                </select>
                <input type="text" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                <input type="text" placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                <button type="submit" className="alert-submit-btn">Submit</button>
              </form>
            )}
            <ul className="alert-list-horizontal">
              <div className="alert-list-spacer" />
              {alerts.map(alert => (
                <li key={alert.id} className={`alert-item-horizontal alert-${alert.type.toLowerCase()}`}>
                  <div className="alert-type">{alert.type}</div>
                  <div className="alert-location">{alert.location}</div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">{alert.time}</div>
                </li>
              ))}
              <div className="alert-list-spacer" />
            </ul>
          </>
        )}
        {tab === 'route' && (
          <>
            <h3>AI-Based Emergency Routing</h3>
            <form className="route-form" onSubmit={handleRoute}>
              <input type="text" placeholder="From (e.g. Accident Site)" value={route.to} onChange={e => setRoute({ ...route, to: e.target.value })} required />
              <input type="text" placeholder="To (e.g. Hospital)" value={route.from} onChange={e => setRoute({ ...route, from: e.target.value })} required />
              <button type="submit" className="route-submit-btn">Get Fastest Route</button>
            </form>
            {routeResult && <div className="route-result">{routeResult}</div>}
          </>
        )}
        {tab === 'tips' && (
          <>
            <h3>Disaster Preparedness Planner</h3>
            <div className="tips-list">
              {disasterTips.map(tip => (
                <div key={tip.stage} className="tips-card">
                  <div className="tips-stage">{tip.stage}</div>
                  <ul>
                    {tip.tips.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
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