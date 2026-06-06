import { Link } from "@tanstack/react-router";
import { isAuthenticated } from "../lib/auth";
import { useLogout } from "../hooks/use-auth";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const authenticated = isAuthenticated();
  const logout = useLogout();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-20 w-full border-b border-outline-variant bg-card transition-shadow duration-200 ease-in-out ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="flex justify-between items-center h-full px-6 max-w-300 mx-auto">
        <Link to="/" className="text-2xl font-bold text-primary no-underline">
          Conecta Bairro
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-base font-bold text-primary border-b-2 border-primary hover:text-primary transition-colors no-underline"
          >
            Buscar Profissional
          </Link>
          <a
            href="#how-it-works"
            className="text-base text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Como Funciona
          </a>
          <a
            href="#for-pros"
            className="text-base text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Para Profissionais
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {authenticated ? (
            <>
              <Link
                to="/profile"
                className="inline-flex items-center justify-center rounded-full border border-outline-variant bg-card p-2 text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md no-underline"
                aria-label="Meu perfil"
                title="Meu perfil"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
              </Link>

              <button
                onClick={logout}
                className="text-sm font-semibold px-4 py-2 text-primary hover:opacity-80 transition-opacity"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold px-4 py-2 text-primary hover:opacity-80 transition-opacity no-underline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all no-underline"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
