import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UrbanMobility.css';
import { FaArrowLeft, FaMobileAlt } from "react-icons/fa";
import { TbBusStop } from "react-icons/tb";
import { IoCarSport } from "react-icons/io5";
import ChatBot from '../components/ChatBot';

const UrbanMobility = () => {
  const navigate = useNavigate();
  return (
    <div className="urban-mobility-container">
      <button className="back-arrow" onClick={() => navigate(-1)} title="Go Back">
        <FaArrowLeft />
      </button>
      <div className="content-wrapper animated-fade">
        <h2 class="AI">Travel With Buddy</h2>
        <br/><br/>
        <div className="option-circle">
          <Link to="/urban-mobility/smart-route" className="option-item top">
            <FaMobileAlt className="icons" /> Smart Router
          </Link>
          <Link to="/urban-mobility/live-tracker" className="option-item left">
            <TbBusStop className="icons" /> Live Bus/Train Tracker
          </Link>
          <Link to="/urban-mobility/carpool" className="option-item right">
            <IoCarSport className="icons" /> Carpool Finder
          </Link>
        </div>
      </div>
      <ChatBot />
    </div>
  );
};

export default UrbanMobility;
