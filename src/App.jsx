import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import LoginRegister from './pages/LoginRegister';
import Register from './pages/Register';
import Main from './pages/Main';
import UrbanMobility from './pages/UrbanMobility';
import PublicSafety from './pages/PublicSafety';
import SmartRoutePlanner from './components/UrbanMobility/SmartRoutePlanner/SmartRoutePlanner';
import LiveTracker from './components/UrbanMobility/LiveTracker/LiveTracker';
import Carpool from './components/UrbanMobility/Carpool/Carpool';
import ErrorBoundary from './components/ErrorBoundary';
import { config } from './config/config';
import './App.css';

const libraries = ['places'];

function App() {
  return (
    <ErrorBoundary>
      <LoadScript googleMapsApiKey={config.GMAPS_API_KEY} libraries={libraries}>
        <Router>
          <Routes>
            <Route path="/" element={<LoginRegister />} />
            <Route path="/register" element={<Register />} />
            <Route path="/main" element={<Main />} />
            <Route path="/urban-mobility" element={<UrbanMobility />} />
            <Route path="/urban-mobility/smart-route" element={<SmartRoutePlanner />} />
            <Route path="/urban-mobility/live-tracker" element={<LiveTracker />} />
            <Route path="/urban-mobility/carpool" element={<Carpool />} />
            <Route path="/public-safety" element={<PublicSafety />} />
          </Routes>
        </Router>
      </LoadScript>
    </ErrorBoundary>
  );
}

export default App;
