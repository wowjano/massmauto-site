import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./Homepage.jsx";
import Admin from "./admin/Admin.jsx";
import VehiclePage from "./pages/VehiclePage.jsx"; // <-- new
import FinancingApply from "./pages/FinancingApply";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/inventory/:slug" element={<VehiclePage />} /> {/* new */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/apply" element={<FinancingApply />} />
    </Routes>
  );
}
