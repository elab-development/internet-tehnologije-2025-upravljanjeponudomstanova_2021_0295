import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';

export default function ApartmentsPage() {
  const { id } = useParams();
  const [apartments, setApartments] = useState([]);
  const [error, setError] = useState('');
  const [minRooms, setMinRooms] = useState(0);
  

  useEffect(() => {
    fetch(`http://localhost:4000/api/buildings/${id}/apartments`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setApartments(data))
      .catch(() => setError('Greška pri učitavanju stanova'));
  }, [id]);

  const filteredApartments = useMemo(() => {
  return apartments.filter(a => a.rooms >= minRooms);
}, [apartments, minRooms]);

  if (error) return <p>{error}</p>;

  return (
  <Layout title="Stanovi">
    <div style={{ marginBottom: 16 }}>
        <label>
            Minimalan broj soba:{' '}
            <input
            type="number"
            value={minRooms}
            onChange={(e) => setMinRooms(Number(e.target.value))}
            style={{ width: 60 }}
            />
        </label>
    </div>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
      {filteredApartments.map((a) => (
        <li key={a.id}>
            <Card>
                <Link to={`/apartments/${a.id}`} style={{ textDecoration: 'none', color: '#111827', fontWeight: 600 }}>
                    Stan {a.number}
                </Link>
                <div style={{ color: '#6b7280', marginTop: 4 }}>
                    {a.area} m² · {a.rooms} sobe · {a.price} €
                </div>
            </Card>
        </li>
      ))}
    </ul>
  </Layout>
);
}
