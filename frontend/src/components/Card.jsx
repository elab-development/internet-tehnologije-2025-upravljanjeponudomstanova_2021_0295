export default function Card({ children }) {
  return (
    <div
      style={{
        background: 'white',
        padding: 14,
        borderRadius: 12,
        border: '1px solid #e5e7eb'
      }}
    >
      {children}
    </div>
  );
}
