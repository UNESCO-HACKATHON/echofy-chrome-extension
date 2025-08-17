import React from "react";
import "./sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedText }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <header>
        <h1>Echofy Analysis</h1>
        <button onClick={onClose}>✖</button>
      </header>

      <section className="results-section">
        <h2>Selected Text</h2>
        <p>{selectedText || "No text selected."}</p>
      </section>

      <section className="mil-tips">
        <h2>MIL Tips</h2>
        <ul>
          <li>Check sources before sharing.</li>
          <li>Look for biased or emotional language.</li>
          <li>AI-generated content might have unnatural phrasing.</li>
        </ul>
      </section>
    </div>
  );
};

export default Sidebar;
