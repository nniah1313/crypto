import React from 'react';
import headerImage from './header.png';
import './App.css';
import Watchlist from './Watchlist';

function App() {
  return (
    <div className="snap-container">
      {/* Landing Section with Logo */}
      <section className="snap-section App">
        <header className="App-header">
          <img src={headerImage} className="App-logo" alt="header" />
          <p>
            BellaFi is a simple crypto widget that allows you to track your favorite cryptocurrencies in real-time.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </section>

      {/* Watchlist Scroll Section */}
      <section className="snap-section">
        <Watchlist />
      </section>
    </div>
  );
}

export default App;

