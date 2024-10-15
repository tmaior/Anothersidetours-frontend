import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DatePicker from "./DatePicker.jsx";
import QtPicker from "./QtPicker.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DatePicker />
  </StrictMode>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QtPicker />
  </StrictMode>
);
