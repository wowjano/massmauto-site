import { Routes, Route } from "react-router-dom";
import Homepage from "./Homepage.jsx";
import Admin from "./admin/Admin.jsx";
import VehiclePage from "./pages/VehiclePage.jsx";
import FinancingApply from "./FinancingApply.jsx";
import CityPage from "./pages/CityPage.jsx";
import { CITIES } from "./content/cities.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/inventory/:slug" element={<VehiclePage />} /> {/* new */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/apply" element={<FinancingApply />} />

      {/* Local landing pages — one route per town in src/content/cities.js */}
      {CITIES.map((c) => (
        <Route key={c.slug} path={`/${c.slug}`} element={<CityPage slug={c.slug} />} />
      ))}
    </Routes>
  );
}
