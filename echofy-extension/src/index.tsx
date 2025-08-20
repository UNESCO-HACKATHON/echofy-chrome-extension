import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Sidebar from "./components/sidebar";

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>("");

  useEffect(() => {
    const toggle = () => {
      const text = window.getSelection()?.toString();
      setSelectedText(text || "");
      setIsOpen(prev => !prev);
    };

    window.addEventListener("toggleSidebar", toggle);
    return () => window.removeEventListener("toggleSidebar", toggle);
  }, []);

  return <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} selectedText={selectedText} />;
};

// Mount in sidebar container injected by content script
const sidebarRoot = document.createElement("div");
document.body.appendChild(sidebarRoot);

const root = createRoot(sidebarRoot); // <-- new API
root.render(<App />);
