import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './Homepage';
import Admin from './admin/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
