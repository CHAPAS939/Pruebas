import { lazy, Suspense, useEffect, useRef } from "react";
const ArtCanvas = lazy(() =>
  import("./ArtCanvas").then((m) => ({ default: m.ArtCanvas })),
);
export function MotionArt({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      ref.current?.classList.toggle("is-playing", e.isIntersecting);
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const webgl: Record<
    number,
    "sculpture" | "product" | "orbital" | "particles" | "orb"
  > = { 0: "sculpture", 1: "product", 2: "orbital", 9: "particles", 10: "orb" };
  return (
    <div
      ref={ref}
      className={`motion-art feed-art-${index}`}
      aria-hidden="true"
    >
      {webgl[index] ? (
        <Suspense
          fallback={<div className="scene-loading">INITIALIZING SCENE</div>}
        >
          <ArtCanvas kind={webgl[index]} />
        </Suspense>
      ) : (
        <>
          {index === 3 && (
            <div className="kinetic">
              <div className="kinetic-orbit" />
              <strong>
                MAKE
                <br />
                <i>IT MOVE.</i>
              </strong>
              <span>FORM / FREQUENCY / FEELING</span>
            </div>
          )}
          {index === 4 && (
            <div className="app-device">
              <div className="device-top">
                09:41 <span>● ▰</span>
              </div>
              <span className="micro">OFFGRID / TODAY</span>
              <h3>
                Take the
                <br />
                long way.
              </h3>
              <div className="landscape">
                <i />
                <i />
                <i />
              </div>
              <div className="app-stats">
                <span>
                  14.8<small>KILOMETRES</small>
                </span>
                <span>
                  630<small>ELEVATION</small>
                </span>
              </div>
              <div className="app-progress">
                <i />
              </div>
              <small>YOUR NEXT ADVENTURE ↗</small>
            </div>
          )}
          {index === 5 && (
            <div className="terminal">
              <div>REVEILLE OS [VERSION 2.1.4]</div>
              <p>INITIALIZING CREATIVE SYSTEM…</p>
              {[
                "MOUNT VISUAL ENGINE",
                "LOAD TYPE SYSTEM",
                "ESTABLISH CONNECTION",
                "CALIBRATE PERCEPTION",
                "ALL SYSTEMS NOMINAL",
              ].map((s, i) => (
                <div
                  className="terminal-line"
                  style={{ animationDelay: `${i * 0.5}s` }}
                  key={s}
                >
                  <span>
                    0{i + 1} / {s}
                  </span>
                  <b>OK</b>
                </div>
              ))}
              <div className="boot-mark">
                R<span>_</span>
              </div>
              <div className="boot-progress">
                <i />
              </div>
            </div>
          )}
          {index === 6 && (
            <div className="editorial-art">
              <span>EXPERIMENT NO. 007</span>
              <strong>
                BEYOND
                <br />
                <i>THE</i>
                <br />
                EXPECTED.
              </strong>
              <div className="editorial-sun" />
              <small>A NEW PERSPECTIVE ↗</small>
            </div>
          )}
          {index === 7 && (
            <div className="brand-art">
              <div className="brand-symbol">
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} style={{ "--i": i } as React.CSSProperties} />
                ))}
              </div>
              <strong>
                COMMON
                <br />
                GROUND®
              </strong>
              <span>GROW INTO SOMETHING NEW.</span>
            </div>
          )}
          {index === 8 && (
            <div className="research-art">
              <div className="moire" />
              <div className="moire second" />
              <span>OPTICAL STUDY — 009</span>
              <strong>
                Perception
                <br />
                is a moving target.
              </strong>
            </div>
          )}
          {index === 11 && (
            <div className="reel-art">
              <div className="reel-disc" />
              <strong>
                <span>PLAY.</span>
                <span>PAUSE.</span>
                <span>REPEAT.</span>
              </strong>
              <small>REVEILLE / MOTION STUDIES</small>
            </div>
          )}
          {index === 12 && (
            <div className="dashboard-art">
              <aside>
                p.
                <i />
                <i />
                <i />
                <i />
              </aside>
              <div className="dashboard-body">
                <div className="micro">
                  PULSE / OVERVIEW <span>LIVE ●</span>
                </div>
                <h3>A clearer picture.</h3>
                <div className="metric-row">
                  <div>
                    <small>REVENUE</small>
                    <b>€24,860</b>
                    <em>↗ 18.6%</em>
                  </div>
                  <div>
                    <small>ACTIVITY</small>
                    <b>8,492</b>
                    <em>↗ 12.4%</em>
                  </div>
                </div>
                <div className="chart">
                  {Array.from({ length: 18 }, (_, i) => (
                    <i
                      key={i}
                      style={{
                        height: `${25 + (Math.sin(i * 0.8) + 1) * 30}%`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="data-rows">
                  {[
                    "Website redesign",
                    "Identity system",
                    "Motion exploration",
                  ].map((s, i) => (
                    <div key={s}>
                      <span>
                        0{i + 1} {s}
                      </span>
                      <b>IN PROGRESS</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
