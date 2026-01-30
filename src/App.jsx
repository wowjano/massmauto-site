import { Routes, Route } from "react-router-dom";
import Homepage from "./Homepage.jsx";
import Admin from "./admin/Admin.jsx";
import VehiclePage from "./pages/VehiclePage.jsx";
import FinancingApply from "./FinancingApply.jsx";

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
