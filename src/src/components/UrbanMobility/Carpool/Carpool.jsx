import React, { useState } from 'react';
import './Carpool.css';
import { FaArrowLeft, FaCarSide, FaUserFriends } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const mockUsers = [
  { id: 1, name: 'Amit', source: 'Main St', destination: 'Central Park', seats: 2, time: '5 min', avatar: '/assets/car_logo.png' },
  { id: 2, name: 'Priya', source: 'Elm St', destination: 'North Station', seats: 1, time: '8 min', avatar: '/assets/car_logo.png' },
  { id: 3, name: 'Rahul', source: 'Main St', destination: 'Park Ave', seats: 3, time: '2 min', avatar: '/assets/car_logo.png' },
];

const locations = [
  'Main St',
  'Elm St',
  'Central Park',
  'North Station',
  'Oak Ave',
  'South End',
  'West Market',
  'East Gate'
];

const Carpool = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [seats, setSeats] = useState('');
  const [arrivingTime, setArrivingTime] = useState('');
  const [search, setSearch] = useState(false);
  const [posts, setPosts] = useState([]);

  const filteredUsers = mockUsers.filter(
    u =>
      (!source || u.source.toLowerCase().includes(source.toLowerCase())) &&
      (!destination || u.destination.toLowerCase().includes(destination.toLowerCase()))
  );

  const filteredPosts = posts.filter(
    p =>
      (!source || p.source.toLowerCase().includes(source.toLowerCase())) &&
      (!destination || p.destination.toLowerCase().includes(destination.toLowerCase()))
  );

  return (
    <div className="carpool-outer">
      <button className="back-arrow" onClick={() => navigate(-1)} title="Go Back">
        <FaArrowLeft />
      </button>
      <div className="carpool-container">
        <h2><FaCarSide style={{marginRight: '8px'}}/>Find a Carpool Buddy</h2>
        <form className="carpool-inputs" style={{display:'flex',flexWrap:'wrap',gap:'0.75rem',marginBottom:'1rem'}} onSubmit={e => {e.preventDefault(); setSearch(true);}}>
          <input
            className="carpool-input"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{flex:'1 1 100px', minWidth:70, maxWidth:120, fontSize:'0.95em', padding:'6px'}}
            required
          />
          <input
            className="carpool-input"
            type="text"
            placeholder="Source"
            value={source}
            onChange={e => setSource(e.target.value)}
            list="source-list"
            autoComplete="off"
            style={{flex:'1 1 100px', minWidth:70, maxWidth:120, fontSize:'0.95em', padding:'6px'}}
            required
          />
          <datalist id="source-list">
            {locations.map(loc => <option key={loc} value={loc} />)}
          </datalist>
          <input
            className="carpool-input"
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            list="destination-list"
            autoComplete="off"
            style={{flex:'1 1 100px', minWidth:70, maxWidth:120, fontSize:'0.95em', padding:'6px'}}
            required
          />
          <datalist id="destination-list">
            {locations.map(loc => <option key={loc} value={loc} />)}
          </datalist>
          <input
            className="carpool-input"
            type="number"
            placeholder="Seats Available"
            value={seats}
            onChange={e => setSeats(e.target.value)}
            min={1}
            style={{flex:'1 1 70px', minWidth:50, maxWidth:80, fontSize:'0.95em', padding:'6px'}}
            required
          />
          <input
            className="carpool-input"
            type="text"
            placeholder="Arriving Time (e.g. 5 min)"
            value={arrivingTime}
            onChange={e => setArrivingTime(e.target.value)}
            style={{flex:'1 1 70px', minWidth:50, maxWidth:80, fontSize:'0.95em', padding:'6px'}}
            required
          />
          <button
            className="carpool-request-btn"
            type="button"
            style={{flex:'1 1 70px', minWidth:50, maxWidth:80, background:'#2e7d32', color:'#fff', fontWeight:'bold', fontSize:'0.95em', padding:'6px'}}
            onClick={() => {
              if(name && source && destination && seats && arrivingTime) {
                setPosts([
                  ...posts,
                  {
                    id: Date.now(),
                    name,
                    source,
                    destination,
                    seats,
                    time: arrivingTime,
                    avatar: '/assets/car_logo.png'
                  }
                ]);
                alert('Your post is sent to the AI road buddy community!');
                setName('');
                setSource('');
                setDestination('');
                setSeats('');
                setArrivingTime('');
              } else {
                alert('Please fill all fields.');
              }
            }}
          >
            Post
          </button>
        </form>
        <div className="carpool-list">
          {/* Show user posts first */}
          {filteredPosts.map(p => (
            <div key={p.id} className="carpool-user-card">
              <img src={p.avatar} alt={p.name} className="carpool-avatar" />
              <div className="carpool-user-info">
                <div className="carpool-user-name"><FaUserFriends style={{marginRight: '4px'}}/>{p.name}</div>
                <div className="carpool-user-route">{p.source} → {p.destination}</div>
                <div className="carpool-user-seats">Seats Available: {p.seats}</div>
                <div className="carpool-user-time">Arriving in: {p.time}</div>
              </div>
              <button className="carpool-request-btn" onClick={() => alert('Your request is sent to the AI road buddy community!')}>Request</button>
            </div>
          ))}
          {/* Then show mock users */}
          {search && filteredUsers.length === 0 && filteredPosts.length === 0 ? (
            <div className="carpool-empty">No carpool buddies found for your route.</div>
          ) : (
            filteredUsers.map(u => (
              <div key={u.id} className="carpool-user-card">
                <img src={u.avatar} alt={u.name} className="carpool-avatar" />
                <div className="carpool-user-info">
                  <div className="carpool-user-name"><FaUserFriends style={{marginRight: '4px'}}/>{u.name}</div>
                  <div className="carpool-user-route">{u.source} → {u.destination}</div>
                  <div className="carpool-user-seats">Seats Available: {u.seats}</div>
                  <div className="carpool-user-time">Arriving in: {u.time}</div>
                </div>
                <button className="carpool-request-btn" onClick={() => alert('Your request is sent to the AI road buddy community!')}>Request</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Carpool;
