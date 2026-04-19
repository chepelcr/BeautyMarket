import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Login() {
  const { user, org, login, isLoading } = useAuthContext();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      if (org) {
        // User has org selected, go to appropriate page based on role
        const destination = user.role === "cajero" ? "/pos" : "/dashboard";
        navigate(destination);
      } else {
        // User logged in but no org selected
        navigate("/organizations/select");
      }
    }
  }, [user, org, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      // Navigation will be handled by the useEffect above after login completes
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl animate-bounce">🍗</div>
          <div className="text-primary font-barlow text-xl font-bold animate-pulse">
            Cargando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍗</div>
          <h1 className="font-barlow font-extrabold text-3xl text-primary tracking-wide">
            POLLOS PORTEÑOS
          </h1>
          <p className="text-muted text-sm mt-1">Sistema de Ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted tracking-widest font-barlow">
              CORREO
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow text-base outline-none focus:border-primary transition-colors"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted tracking-widest font-barlow">
              CONTRASEÑA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow text-base outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-destructive text-sm font-barlow">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary text-white rounded-xl font-barlow font-extrabold text-xl tracking-wide disabled:opacity-50 active:bg-primary-dark transition-colors mt-2"
          >
            {isLoading ? "Ingresando..." : "INGRESAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
