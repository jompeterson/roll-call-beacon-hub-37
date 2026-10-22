import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import splashSvg from "@/assets/splash-artwork.svg?raw";

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
  const markup = useMemo(() => prepareSvg(splashSvg), []);

  return (
    <main className="splash-screen" aria-label="Welcome to Roll Call">
      <div className="splash-artwork">
        <div className="splash-svg" dangerouslySetInnerHTML={{ __html: markup }} />
        <Button variant="splash" className="splash-enter" onClick={onEnter}>
            Click to Enter
          </Button>
      </div>
    </main>
  );
};
