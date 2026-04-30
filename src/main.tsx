import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./App.css";

// Expose React/ReactDOM so the 10MS Auth SDK UMD bundle can use the same instance.
if (typeof window !== "undefined") {
  (window as unknown as { React: typeof React }).React = React;
  (window as unknown as { ReactDOM: typeof ReactDOM }).ReactDOM = ReactDOM;
}

createRoot(document.getElementById("root")!).render(<App />);
