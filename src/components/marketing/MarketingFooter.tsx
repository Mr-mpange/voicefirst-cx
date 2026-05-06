import { Link } from "react-router-dom";

const MarketingFooter = () => (
  <footer className="border-t border-border/40 mt-24">
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
      <div>
        <p className="font-bold mb-2">VoiceAI</p>
        <p className="text-muted-foreground text-xs">Realistic AI voice agents for customer care.</p>
      </div>
      <div>
        <p className="font-semibold mb-2">Product</p>
        <ul className="space-y-1 text-muted-foreground">
          <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
          <li><Link to="/docs" className="hover:text-foreground">Docs</Link></li>
          <li><Link to="/app" className="hover:text-foreground">Try the agent</Link></li>
        </ul>
      </div>
      <div>
        <p className="font-semibold mb-2">Company</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>About</li>
          <li>Contact</li>
        </ul>
      </div>
      <div>
        <p className="font-semibold mb-2">Legal</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>Privacy</li>
          <li>Terms</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} VoiceAI. All rights reserved.
    </div>
  </footer>
);

export default MarketingFooter;