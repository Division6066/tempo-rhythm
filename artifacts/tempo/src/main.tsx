import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

const loader = document.getElementById("app-loading");
if (loader) {
  loader.classList.add("hidden");
  setTimeout(() => loader.remove(), 300);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {});
  });
}
