import React, { useState, useEffect } from 'react';
import './LiveTracker.css';
import { FaArrowLeft, FaMicrophone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Utility to parse CSV safely
function parseCSV(csv, type) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row[0] === headers[0] || row.length < headers.length) continue;

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx]?.replace(/^"|"$/g, '').trim();
    });
    obj.Type = type;
    data.push(obj);
  }
  return data;
}

// Import CSV as raw text
import busCSV from '../../../../Database/local_bus_data.csv?raw';
import trainCSV from '../../../../Database/local_train_data.csv?raw';

const columnNames = [
  'Bus/Train No.',
  'Route Name',
  'From',
  'To',
  'Stop Name',
  'ETA'
];

const LiveTracker = () => {
  const [data, setData] = useState([]);
  // Remove general search box, keep only source and destination
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [listeningField, setListeningField] = useState(null); // 'source' or 'destination' or null
  const navigate = useNavigate();

  useEffect(() => {
    const busData = parseCSV(busCSV, 'Bus');
    const trainData = parseCSV(trainCSV, 'Train');
    setData([...busData, ...trainData]);
  }, []);

  useEffect(() => {
    let filteredData = data;
    const src = source.trim().toLowerCase();
    const dst = destination.trim().toLowerCase();

    if (src) {
      filteredData = filteredData.filter(row => (row['From'] || '').toLowerCase().includes(src));
    }
    if (dst) {
      filteredData = filteredData.filter(row => (row['To'] || '').toLowerCase().includes(dst));
    }
    setFiltered(filteredData);
  }, [source, destination, data]);

  // Voice recognition for source/destination
  const handleVoiceInput = (field) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListeningField(field);
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript.trim().replace(/[^a-zA-Z0-9 ]/g, "");
      if (field === 'source') setSource(transcript);
      else if (field === 'destination') setDestination(transcript);
      setListeningField(null);
    };
    recognition.onerror = () => setListeningField(null);
    recognition.onend = () => setListeningField(null);
    recognition.start();
  };

  return (
    <div className="live-tracker-outer">
      <button className="back-arrow" onClick={() => navigate(-1)} title="Go Back">
        <FaArrowLeft />
      </button>
      <div className="live-tracker-container">
        <h1>Live Bus/Train Tracker</h1>
        <div className="location-input-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 180 }}>
            <input
              className="location-input"
              type="text"
              placeholder="Source"
              value={source}
              onChange={e => setSource(e.target.value)}
              style={{ flex: 1, minWidth: 0 }}
            />
            <button
              className={`voice-btn${listeningField === 'source' ? ' listening' : ''}`}
              onClick={() => handleVoiceInput('source')}
              title="Speak source"
              aria-label="Voice input for source"
              style={{ minWidth: 44 }}
            >
              <FaMicrophone />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 180 }}>
            <input
              className="location-input"
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              style={{ flex: 1, minWidth: 0 }}
            />
            <button
              className={`voice-btn${listeningField === 'destination' ? ' listening' : ''}`}
              onClick={() => handleVoiceInput('destination')}
              title="Speak destination"
              aria-label="Voice input for destination"
              style={{ minWidth: 44 }}
            >
              <FaMicrophone />
            </button>
          </div>
        </div>
        <div style={{ maxHeight: '340px', overflowY: 'auto', width: '100%' }}>
          <table className="live-tracker-table">
            <thead>
              <tr>
                <th>Type</th>
                {columnNames.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columnNames.length + 1} style={{ textAlign: 'center', color: '#888' }}>
                    No results found.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr key={`${row.Type}-${row['Bus/Train No.'] || row['Train No.'] || idx}`}>
                    <td>{row.Type}</td>
                    {columnNames.map(col => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filtered.length > 10 && (
            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.95em', marginTop: 4 }}>
              Scroll to see more results
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTracker;
