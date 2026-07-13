import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css";
import { HashRouter } from "react-router";
import { Toaster } from "sonner";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <Toaster position="top-center" richColors closeButton />
    </HashRouter>
  </React.StrictMode>,
);