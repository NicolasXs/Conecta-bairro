import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAuthenticated, getCurrentUser } from "../lib/auth";
import { useLogout } from "../hooks/use-auth";
import ThemeToggle from "./ThemeToggle";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const activeLinkClass =
  "text-base font-bold text-secondary border-b-2 border-secondary transition-colors no-underline";
const inactiveLinkClass =
  "text-base text-muted-foreground hover:text-secondary transition-colors no-underline";

export default function Header() {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  const logout = useLogout();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isOnHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const initials = getInitials(currentUser?.name);

  return (
    <header
      className={`sticky top-0 z-50 h-20 w-full border-b border-outline-variant bg-card transition-shadow duration-200 ease-in-out ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="flex justify-between items-center h-full px-6 max-w-300 mx-auto">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-secondary no-underline shrink-0">
          Conecta Bairro
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {authenticated ? (
            <>
              <Link
                to="/dashboard"
                className={pathname === "/dashboard" ? activeLinkClass : inactiveLinkClass}
              >
                Dashboard
              </Link>
              <Link
                to="/professionals"
                search={{ workerId: undefined, category: undefined, q: undefined }}
                className={pathname.startsWith("/professionals") ? activeLinkClass : inactiveLinkClass}
              >
                Profissionais
              </Link>
              <Link
                to="/profile"
                className={pathname === "/profile" ? activeLinkClass : inactiveLinkClass}
              >
                Meu Perfil
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/professionals"
                search={{ workerId: undefined, category: undefined, q: undefined }}
                className={pathname.startsWith("/professionals") ? activeLinkClass : inactiveLinkClass}
              >
                Profissionais
              </Link>
              <a href={isOnHome ? "#how-it-works" : "/#how-it-works"} className={inactiveLinkClass}>
                Como Funciona
              </a>
              <a href={isOnHome ? "#for-pros" : "/#for-pros"} className={inactiveLinkClass}>
                Para Profissionais
              </a>
            </>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {authenticated ? (
            <>
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold hover:opacity-90 transition-opacity no-underline shadow-sm overflow-hidden"
                aria-label="Meu perfil"
                title={currentUser?.name ?? "Meu perfil"}
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name ?? "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </Link>
              <button
                onClick={logout}
                className="text-sm font-semibold px-4 py-2 text-muted-foreground hover:text-secondary transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold px-4 py-2 text-secondary hover:opacity-80 transition-opacity no-underline"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-5 py-2 bg-secondary text-secondary-foreground rounded-lg hover:shadow-lg transition-all no-underline"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-40 bg-background border-t border-outline-variant flex flex-col">
          <nav className="flex flex-col p-6 gap-1">
            {authenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-muted transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">dashboard</span>
                  Dashboard
                </Link>
                <Link
                  to="/professionals"
                  search={{ workerId: undefined, category: undefined, q: undefined }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-muted transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">handyman</span>
                  Profissionais
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-muted transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">manage_accounts</span>
                  Meu Perfil
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/professionals"
                  search={{ workerId: undefined, category: undefined, q: undefined }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-muted transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">handyman</span>
                  Profissionais
                </Link>
                <a
                  href={isOnHome ? "#how-it-works" : "/#how-it-works"}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-muted transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
                  Como Funciona
                </a>
                <a
                  href={isOnHome ? "#for-pros" : "/#for-pros"}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-muted transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">engineering</span>
                  Para Profissionais
                </a>
              </>
            )}
          </nav>

          <div className="px-6 pt-2 border-t border-outline-variant mt-auto pb-8">
            {authenticated ? (
              <div className="flex flex-col gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 no-underline"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name ?? "Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {currentUser?.name ?? "Meu perfil"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="w-full py-3 text-sm font-semibold text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors"
                >
                  Sair da conta
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="w-full py-3 text-center text-sm font-semibold border border-outline-variant rounded-xl hover:bg-muted transition-colors no-underline text-foreground"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="w-full py-3 text-center text-sm font-semibold bg-secondary text-secondary-foreground rounded-xl hover:opacity-90 transition-opacity no-underline"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
