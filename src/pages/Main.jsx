import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCarCrash, FaArrowLeft } from "react-icons/fa";
import { RiBusWifiFill } from "react-icons/ri";
import ChatBot from '../components/ChatBot';
import './Main.css';

const Main = () => {
  const navigate = useNavigate();
  return (
    <div className="main-options-container">
      <button className="back-arrow" onClick={() => navigate(-1)} title="Go Back">
        <FaArrowLeft />
      </button>
      <img src="/assets/logo.png" alt="Main Options" className="elegant-image animated-fade" />
      <h1 class="AI">AI Road Buddy</h1>
      <h1 class="AI">Choose your Need:</h1>
      <div className="options">
        <button className='button' onClick={() => navigate('/urban-mobility')}><RiBusWifiFill className='icons'/>Travel With Buddy</button>
        <button className='button' onClick={() => navigate('/public-safety')}><FaCarCrash  className='icons'/>Buddy Rescuer</button>
      </div>
      <div><ChatBot/></div>
    </div>
  );
};

export default Main;
