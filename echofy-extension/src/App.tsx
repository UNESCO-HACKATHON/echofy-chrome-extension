import React from "react";
import "./App.css";

function App() {
  return (
    <div className="popup-container">
      <header>
        <h1>Echofy</h1>
        <p>Detect misinformation and AI-generated content</p>
      </header>

      <section className="results-section">
        <h2>Analysis Results</h2>
        <div className="results-placeholder">
          Results will appear here after analyzing selected text.
        </div>
      </section>

      <section className="mil-tips">
        <h2>Media Literacy Tips</h2>
        <ul>
          <li>Check the source of the information.</li>
          <li>Look for emotional or biased language.</li>
          <li>Verify facts using trusted sources.</li>
        </ul>
      </section>

      <footer>
        <small>🌍 Africa-focused | English only</small>
      </footer>
    </div>
  );
}

export default App;
