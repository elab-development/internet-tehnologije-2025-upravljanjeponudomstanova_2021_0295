import { Routes, Route } from 'react-router-dom';
import BuildingsPage from './pages/BuildingsPage';
import ApartmentsPage from './pages/ApartmentsPage';
import ApartmentDetailsPage from './pages/ApartmentDetailsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BuildingsPage />} />
      <Route path="/buildings/:id" element={<ApartmentsPage />} />
      <Route path="/apartments/:id" element={<ApartmentDetailsPage />} />
    </Routes>
  );
}

export default App;
