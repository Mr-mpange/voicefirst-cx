import { Link } from "react-router-dom";

const NAVY_DEEP = "#0f1b3d";
const NAVY_ACCENT = "#3b6fa0";
const PAPER = "#e8edf3";

const MarketingFooter = () => (
  <footer
    className="border-t font-sans mt-16"
    style={{ backgroundColor: NAVY_DEEP, borderColor: `${NAVY_ACCENT}33`, color: PAPER }}
  >
    <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-14 grid gap-10 md:grid-cols-4 text-sm">
      <div className="md:col-span-1">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center font-serif text-base"
            style={{ backgroundColor: NAVY_ACCENT, color: PAPER }}
          >
            A
          </div>
          <span className="font-serif text-xl">AudientAssist</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: `${PAPER}80` }}>
          Enterprise bilingual voice AI for inbound customer support across East Africa.
        </p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
          Product
        </p>
        <ul className="space-y-2" style={{ color: `${PAPER}99` }}>
          <li><Link to="/how-it-works" className="hover:text-white">How it works</Link></li>
          <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
          <li><Link to="/docs" className="hover:text-white">Docs</Link></li>
          <li><Link to="/app" className="hover:text-white">Try Alex</Link></li>
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
          Company
        </p>
        <ul className="space-y-2" style={{ color: `${PAPER}99` }}>
          <li>About</li>
          <li>Contact</li>
          <li>Customers</li>
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
          Legal
        </p>
        <ul className="space-y-2" style={{ color: `${PAPER}99` }}>
          <li>Privacy</li>
          <li>Terms</li>
          <li>Security</li>
        </ul>
      </div>
    </div>
    <div
      className="border-t py-5 text-center text-xs"
      style={{ borderColor: `${NAVY_ACCENT}26`, color: `${PAPER}66` }}
    >
      © {new Date().getFullYear()} AudientAssist. All rights reserved.
    </div>
  </footer>
);

export default MarketingFooter;