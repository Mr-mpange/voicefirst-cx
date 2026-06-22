import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const NAVY_DEEP = "#0f1b3d";
const NAVY_ACCENT = "#3b6fa0";
const PAPER = "#e8edf3";

const links = [
  { to: "/", label: "Overview" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Docs" },
];

const MarketingNav = () => {
  const { user } = useAuth();
  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-xl font-sans"
      style={{ backgroundColor: `${NAVY_DEEP}CC`, borderColor: `${NAVY_ACCENT}33` }}
    >
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center font-serif text-base"
            style={{ backgroundColor: NAVY_ACCENT, color: PAPER }}
          >
            A
          </div>
          <span className="font-serif text-xl tracking-tight" style={{ color: PAPER }}>
            AudientAssist
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive ? "text-white" : "hover:text-white"
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? PAPER : `${PAPER}99`,
                backgroundColor: isActive ? `${NAVY_ACCENT}33` : "transparent",
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: NAVY_ACCENT }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden sm:inline-block text-sm"
                style={{ color: `${PAPER}99` }}
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: NAVY_ACCENT }}
              >
                Deploy Alex
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default MarketingNav;