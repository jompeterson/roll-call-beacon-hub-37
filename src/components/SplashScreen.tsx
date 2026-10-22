import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import splashArtwork from "@/assets/splash.svg.asset.json";

// Pieces of the artwork, each wrapped in its own animated group
const PARTS: Record<string, string> = {
  g144: "sa-brush",
  g1432: "sa-bubble",
  g1436: "sa-letter sa-l1",
  g1452: "sa-letter sa-l2",
  g1456: "sa-letter sa-l3",
  g1460: "sa-letter sa-l4",
  g1476: "sa-letter sa-l5",
  g1480: "sa-letter sa-l6",
  g1600: "sa-welcome",
  g1596: "sa-to",
  g1588: "sa-live",
  g1584: "sa-building",
  g1592: "sa-underline",
};

function prepareSvg(text: string): string {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = doc.documentElement;
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Welcome to Roll Call. We are live! Let’s start building…");
  Object.entries(PARTS).forEach(([id, cls]) => {
    const el = doc.getElementById(id);
    if (!el?.parentNode) return;
    const wrap = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    wrap.setAttribute("class", `sa ${cls}`);
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
  });
  return new XMLSerializer().serializeToString(svg);
}

export const SplashScreen = ({ onEnter }: { onEnter: () => void }) => {
  const [markup, setMarkup] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(splashArtwork.url)
      .then(r => r.text())
      .then(t => active && setMarkup(prepareSvg(t)))
      .catch(() => active && setMarkup(""));
    return () => { active = false; };
  }, []);

  return (
    <main className="splash-screen" aria-label="Welcome to Roll Call">
      <div className="splash-artwork">
        {markup ? (
          <div className="splash-svg" dangerouslySetInnerHTML={{ __html: markup }} />
        ) : markup === "" ? (
          <img src={splashArtwork.url} alt="Welcome to Roll Call. We are live! Let’s start building…" className="block h-auto w-full" />
        ) : (
          <div className="aspect-video w-full" />
        )}
        {markup !== null && (
          <Button variant="splash" className="splash-enter" onClick={onEnter}>
            Click to Enter
          </Button>
        )}
      </div>
    </main>
  );
};
