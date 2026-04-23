import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// `basename` lifts the router onto the Vite base path (e.g. `/news-radar-dashboard/`).
// Trim any trailing slash so BrowserRouter sees `/news-radar-dashboard`, not `/news-radar-dashboard/`.
const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
