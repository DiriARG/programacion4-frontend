import { useState } from "react";
import { Link, useNavigate } from "react-router";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    // --- MOCK TEMPORAL (Simula respuesta del servidor) ---
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 1 segundo

    const data = {
      ok: true,
      token: "mock-jwt-token-12345",
      userType: "ADMINISTRADOR" // Cambia a "ALUMNO" o "PROFESOR" para probar las redirecciones
    };
    // ----------------------------------------------------

    setLoading(false); // <-- Esencial para quitar el "Cargando..."

    if (data?.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.userType);

      if (data.userType === "ALUMNO") {
        navigate("/alumno");
      } else if (data.userType === "PROFESOR") {
        navigate("/profesor");
      } else if (data.userType === "ADMINISTRADOR") {
        navigate("/admin");
      } else {
        setError("Tipo de usuario no válido");
      }
    } else {
      setError(data?.message || "Credenciales incorrectas");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3 className={styles.title}>Panel Administrativo</h3>
        <p className={styles.subtitle}>Inicia sesión con tu cuenta</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="admin@gym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>

        <Link to="/" className={styles.backLink}>
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}