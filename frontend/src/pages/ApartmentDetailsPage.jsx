import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

export default function ApartmentDetailsPage() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:4000/api/apartments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setApartment(data))
      .catch(() => setError('Greška pri učitavanju stana'));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!apartment) return <p>Učitavanje…</p>;

  return (
  <Layout title={`Stan ${apartment.number}`}>
    <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
      <p><strong>Površina:</strong> {apartment.area} m²</p>
      <p><strong>Sobe:</strong> {apartment.rooms}</p>
      <p><strong>Cena:</strong> {apartment.price} €</p>
      <p><strong>Status:</strong> {apartment.status}</p>
    </div>
  </Layout>
);
}
