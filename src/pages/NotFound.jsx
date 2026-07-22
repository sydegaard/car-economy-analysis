import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold text-primary/30 font-mono">404</h1>
          <div className="h-0.5 w-16 bg-border mx-auto" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Siden finnes ikke</h2>
          <p className="text-muted-foreground leading-relaxed">
            Denne siden kunne ikke finnes.
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Home className="w-4 h-4" />
            Til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}
