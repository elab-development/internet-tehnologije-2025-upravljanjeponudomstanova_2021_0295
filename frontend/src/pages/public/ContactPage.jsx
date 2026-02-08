import { useState } from "react";
import { api } from "../../api/apiClient";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);

    // minimalna validacija (bez rizika)
    if (!name.trim() || !email.trim() || !message.trim()) {
      setSending(false);
      setError("Popuni ime, email i poruku.");
      return;
    }

    try {
      await api.post("/inquiries", {
        // apartmentId se ne šalje => opšti upit
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      });

      setSuccess("Upit je poslat.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError(err?.message || "Greška pri slanju upita");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="page-head">
          <div>
            <h2 className="page-title">Kontakt</h2>
            <p className="page-sub">Pošalji opšti upit (bez vezivanja za stan).</p>
          </div>
        </div>

        <div className="card">
          {error ? (
            <div className="error" style={{ marginBottom: 10 }}>
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="success" style={{ marginBottom: 10 }}>
              {success}
            </div>
          ) : null}

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Ime
              </label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Unesi ime"
                disabled={sending}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Email
              </label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="npr. petar@email.com"
                disabled={sending}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Telefon (opciono)
              </label>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+381..."
                disabled={sending}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Poruka
              </label>
              <textarea
                className="textarea"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Napiši poruku..."
                disabled={sending}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? "Slanje..." : "Pošalji"}
            </button>

            <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
              Podaci se šalju na backend kao Inquiry (opšti upit).
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
