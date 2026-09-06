import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameAudioProvider } from './context/GameAudioContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameAudioProvider>
      <App />
    </GameAudioProvider>
  </React.StrictMode>
);
