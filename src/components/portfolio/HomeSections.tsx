import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { feeds, projects, questions, siteConfig } from "../../lib/site-config";
import { MotionArt } from "./MotionArt";
import { useMotion } from "./use-motion";
const ArtCanvas = lazy(() =>
  import("./ArtCanvas").then((m) => ({ default: m.ArtCanvas })),
);
function Scene({
  kind = "sculpture",
}: {
  kind?: "sculpture" | "product" | "orbital" | "particles" | "orb";
}) {
  return (
    <Suspense fallback={<div className="scene-loading">FORM IS LOADING…</div>}>
      <ArtCanvas kind={kind} />
    </Suspense>
  );
}
function ProjectArt({ kind }: { kind: string }) {
  switch (kind) {
    case "forma":
      return (
        <div className="forma-art">
          <span>Objects. Ideas. Possibilities.</span>
          <div className="forma-shape">
            <i />
            <i />
            <i />
          </div>
          <strong>
            forma<span>®</span>
          </strong>
          <small>A NEW SHAPE OF THINGS — VOL. 01</small>
        </div>
      );
    case "offgrid":
      return <MotionArt index={4} />;
    case "ordinary":
      return (
        <div className="ordinary-art">
          <span>INDEPENDENT JOURNAL / ISSUE 001</span>
          <strong>
            NOT
            <br />
            <i>ORDI</i>
            <br />
            NARY.
          </strong>
          <div className="ordinary-sticker">
            DIFFERENT
            <br />
            BY DESIGN ↗
          </div>
        </div>
      );
    case "korus":
      return (
        <div className="korus-art">
          <span>korus®</span>
          <h3>
            Good work.
            <br />
            Great rhythm.
          </h3>
          <div className="korus-window">
            <div className="window-dots">● ● ●</div>
            <div className="korus-row">
              <b>Today, in sync.</b>
              <span>+ New task</span>
            </div>
            <div className="task-columns">
              {["TO DO", "IN PROGRESS", "DONE"].map((s, i) => (
                <div key={s}>
                  <small>{s}</small>
                  {[0, 1, 2].map((j) => (
                    <div className="task" key={j}>
                      <i
                        style={{
                          background: ["#bcacf3", "#c3d6ac", "#f3b88b"][i],
                        }}
                      />
                      <b>
                        {
                          [
                            "Explore direction",
                            "Build something",
                            "Make it move",
                          ][(i + j) % 3]
                        }
                      </b>
                      <span>Design team ◉</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "sbe":
      return (
        <div className="sbe-art">
          <span>IDEAS LIVE HERE.</span>
          <div className="sbe-emblem">
            sbe<span>✳</span>
          </div>
          <strong>
            A hub for
            <br />
            what’s next.
          </strong>
          <small>SPACE / PEOPLE / POSSIBILITIES</small>
        </div>
      );
    case "motion":
      return (
        <div className="motion-project">
          <Scene kind="orbital" />
          <span>
            IN CONSTANT
            <br />
            <b>MOTION.</b>
          </span>
        </div>
      );
    case "glass":
      return (
        <div className="glass-art">
          <div className="glass-light" />
          <div className="glass-card">
            <span>REFRACT / 01</span>
            <strong>
              Clear
              <br />
              thinking.
            </strong>
            <div>↗</div>
          </div>
          <small>A STUDY IN LIGHT & MATERIAL</small>
        </div>
      );
    case "dashboard":
      return <MotionArt index={12} />;
    case "identity":
      return <MotionArt index={7} />;
    case "type":
      return (
        <div className="type-art">
          <span>TYPE STUDY — 01</span>
          <strong>
            Aa
            <br />
            <i>Bb</i>
          </strong>
          <div>
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <br />
            abcdefghijklmnopqrstuvwxyz
            <br />
            0123456789 !?&@
          </div>
        </div>
      );
    default:
      return (
        <div className="objects-art">
          <Scene kind="product" />
          <span>
            OBJECTS
            <br />
            OF INTEREST.
          </span>
          <small>FORM FOLLOWS CURIOSITY / 011</small>
        </div>
      );
  }
}
export function HomeSections() {
  const root = useRef<HTMLElement>(null);
  useMotion(root);
  const [activeFeed, setActiveFeed] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const isOpen = activeFeed !== null || activeProject !== null;
  useEffect(() => {
    if (isOpen) modal.current?.showModal();
    else modal.current?.close();
  }, [isOpen]);
  const close = () => {
    setActiveFeed(null);
    setActiveProject(null);
  };
  const about = "Good design makes you look. Great experiences make you feel.";
  return (
    <main id="main" ref={root}>
      <section className="hero" id="top">
        <div className="hero-curtain" />
        <div className="hero-meta">
          <span>
            CREATIVE DEVELOPMENT
            <br />& DIGITAL EXPERIENCES
          </span>
          <span>
            DESIGN DRIVEN.
            <br />
            CODE ENABLED.
          </span>
          <span className="hero-edition">
            PORTFOLIO — VOL. 01
            <br />
            EXPLORATIONS / 2026
          </span>
        </div>
        <h1 className="hero-title">
          <span className="line-one">A little less</span>
          <span className="line-two">
            ordinary<span className="title-period">.</span>
          </span>
        </h1>
        <div className="hero-object">
          <Scene />
        </div>
        <div className="object-label">
          <span className="crosshair">+</span> FIG. 001 — FORM IN MOTION
        </div>
        <div className="hero-bottom">
          <p>
            Thoughtful design.
            <br />
            Unexpected interactions.
            <br />
            Made to be felt.
          </p>
          <a
            className="round-link"
            href="#work"
            aria-label="Explore selected work"
          >
            ↘
          </a>
          <a href="#about" className="scroll-label">
            SCROLL TO EXPLORE <span>↓</span>
          </a>
        </div>
      </section>
      <section className="about section-pad" id="about">
        <div className="section-index">
          <span>01 / THE APPROACH</span>
          <span>CURIOUS BY NATURE</span>
        </div>
        <div className="about-layout">
          <div className="about-left">
            <div className="about-orbit">✳</div>
            <span className="micro">IDEA → FORM → FEELING</span>
          </div>
          <div>
            <h2 className="about-statement">
              {about.split(" ").map((word, i) => (
                <span className="about-word" key={i}>
                  {word}{" "}
                </span>
              ))}
            </h2>
            <div className="about-detail">
              <p>
                Reveille is an independent creative playground at the
                intersection of design and technology. Exploring how things
                look, move, and make us feel.
              </p>
              <p>
                From a first sketch to the last interaction, every detail is an
                opportunity to do something a little less ordinary.
              </p>
            </div>
            <a className="text-link" href="#work">
              Enter the playground <span>↘</span>
            </a>
          </div>
        </div>
      </section>
      <section className="work section-pad" id="work">
        <div className="section-index">
          <span>02 / SELECTED EXPLORATIONS</span>
          <span>2026 — ONGOING</span>
        </div>
        <div className="section-heading">
          <h2>
            Works<span className="serif">&</span>
            <br />
            <span className="outline">wonders.</span>
          </h2>
          <p>
            Eleven original concept studies.
            <br />
            One restless curiosity.
            <br />
            <span className="micro">DESIGN / DEVELOPMENT / MOTION</span>
          </p>
        </div>
        <div className="project-grid">
          {projects.map((project, i) => (
            <article
              className={`project project-${project.kind}`}
              key={project.kind}
            >
              <button
                className="project-art"
                aria-label={`Explore ${project.name}`}
                onClick={() => setActiveProject(i)}
              >
                <div className="project-visual">
                  <ProjectArt kind={project.kind} />
                </div>
                <span className="project-open">↗</span>
              </button>
              <div className="project-caption">
                <div>
                  <span className="micro">/{project.year}</span>
                  <h3>{project.name}</h3>
                </div>
                <span>{project.category}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="design-section" aria-label="Design and code">
        <div className="section-index">
          <span>03 / TWO SIDES. ONE MIND.</span>
          <span>SCROLL TO CONNECT ↓</span>
        </div>
        <div className="design-stage">
          <div className="design-word" data-design-word="design">
            DESIGN
          </div>
          <span data-design-amp className="design-amp">
            &
          </span>
          <div className="design-word outline" data-design-word="code">
            CODE
          </div>
        </div>
        <div className="design-note">
          <span>
            THE MAGIC HAPPENS
            <br />
            SOMEWHERE IN BETWEEN.
          </span>
          <p>
            Not separate disciplines.
            <br />
            One continuous conversation.
          </p>
        </div>
      </section>
      <section className="surveillance section-pad" id="lab">
        <div className="section-index">
          <span>// SURVEILLANCE SYSTEM v2.1.4</span>
          <span>
            <i className="rec-dot" /> RECORDING ACTIVE // 13/13 FEEDS ONLINE
          </span>
        </div>
        <div className="lab-heading">
          <h2>
            Never
            <br />
            <span className="serif">stand still.</span>
          </h2>
          <div>
            <p>
              A living archive of motion,
              <br />
              materials, and happy accidents.
            </p>
            <span className="micro">
              13 REAL-TIME EXPERIMENTS / CLICK TO EXPAND
            </span>
          </div>
        </div>
        <div className="feed-grid">
          {feeds.map((feed, i) => (
            <button
              className="feed"
              key={feed}
              onClick={() => setActiveFeed(i)}
              aria-label={`Expand CAM-${String(i + 1).padStart(2, "0")} ${feed}`}
            >
              <div className="feed-hud">
                <span>CAM-{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <i className="rec-dot" /> REC
                </span>
              </div>
              <MotionArt index={i} />
              <div className="feed-caption">
                <span>{feed}</span>
                <span>↗</span>
              </div>
            </button>
          ))}
        </div>
        <div className="lab-bottom">
          <span className="micro">
            ALL VISUALS GENERATED IN REAL TIME. NO PRERENDERED VIDEO.
          </span>
          <Link to="/library" className="text-link">
            Inside the experiments ↗
          </Link>
        </div>
      </section>
      <section className="faq section-pad" id="faq">
        <div className="faq-intro">
          <span className="micro">04 / A FEW GOOD QUESTIONS</span>
          <h2>
            Glad
            <br />
            you asked<span className="serif">.</span>
          </h2>
          <p>
            Some things are worth
            <br />a little more explanation.
          </p>
        </div>
        <div className="faq-list">
          {questions.map(([q, a], i) => (
            <details className="faq-item" key={q}>
              <summary>
                <span className="micro">0{i + 1}</span>
                <h3>{q}</h3>
                <span className="faq-plus">+</span>
              </summary>
              <div className="faq-answer">
                <p>{a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
      <footer className="footer section-pad" id="contact">
        <div className="section-index">
          <span>05 / THE NEXT GOOD THING</span>
          <span>STARTS WITH A CONVERSATION ↙</span>
        </div>
        <div className="footer-title-wrap">
          <h2 className="footer-title">
            Let’s make
            <br />
            <span className="serif">a little noise.</span>
            <span className="footer-star">✳</span>
          </h2>
        </div>
        <div className="footer-actions">
          <p>
            Have an idea worth waking up for?
            <br />
            Let’s see where it takes us.
          </p>
          {siteConfig.email ? (
            <a className="contact-link" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email} ↗
            </a>
          ) : (
            <a className="contact-link" href={siteConfig.github}>
              Find us on GitHub ↗
            </a>
          )}
          <Link to="/library" className="micro">
            EXPLORE THE LIBRARY ↗
          </Link>
        </div>
      </footer>
      <dialog
        className="art-modal"
        ref={modal}
        onCancel={close}
        onClick={(e) => {
          if (e.target === modal.current) close();
        }}
        aria-label={
          activeFeed !== null
            ? feeds[activeFeed]
            : activeProject !== null
              ? projects[activeProject].name
              : "Project viewer"
        }
      >
        <button className="modal-close" onClick={close} autoFocus>
          Close ×
        </button>
        {activeFeed !== null && (
          <>
            <div className="modal-heading">
              <span>
                CAM-{String(activeFeed + 1).padStart(2, "0")} /{" "}
                {feeds[activeFeed]}
              </span>
              <span>
                <i className="rec-dot" /> LIVE EXPERIMENT
              </span>
            </div>
            <div className="modal-art">
              <MotionArt index={activeFeed} />
            </div>
          </>
        )}
        {activeProject !== null && (
          <>
            <div className="modal-heading">
              <span>
                {projects[activeProject].name} /{" "}
                {projects[activeProject].category}
              </span>
              <span>ORIGINAL CONCEPT STUDY</span>
            </div>
            <div
              className={`modal-art project-${projects[activeProject].kind}`}
            >
              <ProjectArt kind={projects[activeProject].kind} />
            </div>
            <p>
              {projects[activeProject].subtitle} An independent exploration of{" "}
              {projects[activeProject].category.toLowerCase()}, created for this
              playground.
            </p>
          </>
        )}
      </dialog>
    </main>
  );
}
