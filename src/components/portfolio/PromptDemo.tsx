import { lazy, Suspense, useEffect, useRef, useState } from "react";
const ArtCanvas = lazy(() =>
  import("./ArtCanvas").then((m) => ({ default: m.ArtCanvas })),
);
export function PromptDemo({ demo }: { demo: string }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState("idle");
  const [time, setTime] = useState(0);
  const [progress, setProgress] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (demo !== "ascii") return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      clearInterval(timer);
      if (visible && !media.matches && !document.hidden)
        timer = setInterval(() => setTime((t) => t + 0.13), 100);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    if (ref.current) io.observe(ref.current);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      io.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [demo]);
  return (
    <div ref={ref} className={`prompt-demo demo-${demo}`}>
      {demo === "menu" && (
        <>
          <button
            className="demo-menu"
            aria-label="Toggle menu icon"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            <i />
            <i />
          </button>
          <span className="demo-hint">
            CLICK TO {expanded ? "CLOSE" : "OPEN"}
          </span>
        </>
      )}
      {demo === "ascii" && (
        <>
          <pre aria-label="Animated ASCII wave">
            {Array.from({ length: 12 }, (_, y) =>
              Array.from(
                { length: 36 },
                (_, x) =>
                  ".:+*#@"[
                    Math.min(
                      5,
                      Math.floor(
                        (Math.sin(x * 0.3 + time) * Math.cos(y * 0.4 - time) +
                          1) *
                          3,
                      ),
                    )
                  ],
              ).join(""),
            ).join("\n")}
          </pre>
          <span className="demo-hint">A SIGNAL IN THE NOISE</span>
        </>
      )}
      {(demo === "orb" || demo === "orbital") && (
        <>
          <div className={`demo-scene orb-state-${state}`}>
            <Suspense fallback={<span>Loading scene…</span>}>
              <ArtCanvas
                kind={demo === "orb" ? "orb" : "orbital"}
                intensity={
                  state === "idle" ? 0.04 : state === "thinking" ? 0.12 : 0.2
                }
              />
            </Suspense>
          </div>
          {demo === "orb" && (
            <div className="demo-controls">
              {["idle", "thinking", "speaking"].map((s) => (
                <button
                  key={s}
                  aria-pressed={s === state}
                  onClick={() => setState(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {demo === "magnetic" && (
        <button
          className="magnetic-demo"
          onPointerMove={(e) => {
            if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px,${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "HELLO THERE ↗" : "COME CLOSER ↗"}
        </button>
      )}
      {demo === "type" && (
        <>
          <div className="kinetic-demo">
            <strong
              style={{ transform: `translateX(${(progress - 50) * 0.5}%)` }}
            >
              MAKE
            </strong>
            <strong
              className="outline"
              style={{ transform: `translateX(${-(progress - 50) * 0.5}%)` }}
            >
              IT MOVE.
            </strong>
          </div>
          <label className="range-label">
            CONTROL THE RHYTHM
            <input
              aria-label="Animation progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </label>
        </>
      )}
    </div>
  );
}
