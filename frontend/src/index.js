import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress unhandled promise rejections coming from the MetaMask browser
// extension's own inpage.js. These are fired by the extension itself and
// are completely outside our control — they do NOT affect app functionality.
window.addEventListener('unhandledrejection', (event) => {
  const stack = event.reason?.stack || '';
  const message = event.reason?.message || '';
  if (
    stack.includes('chrome-extension://') ||
    message.includes('MetaMask') ||
    message.includes('Failed to connect to MetaMask')
  ) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
