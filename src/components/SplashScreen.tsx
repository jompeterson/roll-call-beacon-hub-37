import { Button } from "@/components/ui/button";
import splashArtwork from "@/assets/splash.svg.asset.json";

export const SplashScreen = ({ onEnter }: { onEnter: () => void }) => (
  <main className="splash-screen" aria-label="Welcome to Roll Call">
    <div className="splash-artwork">
      <img
        src={splashArtwork.url}
        alt="Welcome to Roll Call. We are live! Let’s start building…"
        className="block h-auto w-full"
      />
      <Button variant="splash" className="splash-enter" onClick={onEnter}>
        Click to Enter
      </Button>
    </div>
  </main>
);