import React from "react";
import { createRoot } from "react-dom/client";
import './editor/global.css';
import Editor from "./editor/editor";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Editor />
  </React.StrictMode>,
);
