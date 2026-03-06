import React, { useState, useEffect } from 'react';
import ExampleGenerator from './components/ExampleGenerator';
import { checkHealth } from './services/apiClient';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkApiStatus = async () => {
      const isHealthy = await checkHealth();
      setApiStatus(isHealthy ? 'connected' : 'disconnected');
    };

    checkApiStatus();
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">Small Group Assistant</h1>
          <p className="app__subtitle">AI-Powered Math Tutor</p>
        </div>
        <div className="app__status">
          {apiStatus === 'checking' && (
            <span className="app__status-badge app__status-badge--checking">
              Checking...
            </span>
          )}
          {apiStatus === 'connected' && (
            <span className="app__status-badge app__status-badge--connected">
              ✓ Connected
            </span>
          )}
          {apiStatus === 'disconnected' && (
            <span className="app__status-badge app__status-badge--disconnected">
              ✗ API Offline
            </span>
          )}
        </div>
      </header>

      <main className="app__main">
        {apiStatus === 'disconnected' && (
          <div className="app__warning">
            <p>
              <strong>Backend API is not running.</strong> Please ensure the
              backend server is started with <code>npm run dev:backend</code>
            </p>
          </div>
        )}

        <ExampleGenerator />
      </main>

      <footer className="app__footer">
        <p>SmallGroupAssistant v0.1.0 • Uses Claude 3.5 Sonnet</p>
      </footer>
    </div>
  );
}

export default App;
