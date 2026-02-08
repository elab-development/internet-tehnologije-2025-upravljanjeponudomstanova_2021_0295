import { useEffect, useState } from "react";

export default function EntityForm({
  title,
  fields = [],
  initialValues = {},
  submitLabel = "Sačuvaj",
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setValues(initialValues || {});
  }, [initialValues]);

  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);
      await onSubmit?.(values);
    } catch (err) {
      setError(err?.message || "Greška pri čuvanju");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}

      {error ? (
        <div className="error" style={{ marginBottom: 10 }}>
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        {fields.map((f) => {
          const v = values?.[f.name] ?? "";

          return (
            <div key={f.name} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                {f.label}
              </label>

              {f.type === "select" ? (
                <select
                  className="select"
                  value={v}
                  onChange={(e) => setField(f.name, e.target.value)}
                  disabled={saving}
                >
                  {(f.options || []).map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  className="textarea"
                  rows={f.rows || 4}
                  value={v}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder || ""}
                  disabled={saving}
                />
              ) : (
                <input
                  className="input"
                  type={f.type || "text"}
                  value={v}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder || ""}
                  disabled={saving}
                />
              )}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Čuvanje..." : submitLabel}
          </button>

          {onCancel ? (
            <button
              type="button"
              className="btn"
              onClick={onCancel}
              disabled={saving}
            >
              Otkaži
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
