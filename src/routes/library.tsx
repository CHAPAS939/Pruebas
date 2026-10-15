import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { prompts } from "../lib/prompts";
export function Library() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = prompts.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.title} ${p.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main id="main" className="library section-pad">
      <div className="section-index" id="top">
        <span>THE OPEN PLAYGROUND</span>
        <Link to="/">BACK TO THE PORTFOLIO ↗</Link>
      </div>
      <h1>
        Small details.
        <br />
        <span className="serif">Big difference.</span>
      </h1>
      <div className="library-intro">
        <p>
          A collection of interactions, motion experiments,
          <br />
          and useful little things. Open them. Play. Make them yours.
        </p>
        <span className="micro">SIX EXPERIMENTS / ALWAYS CURIOUS</span>
      </div>
      <div className="library-toolbar">
        <div className="filters" aria-label="Filter by category">
          {["All", "Interaction", "Typography", "WebGL"].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
              {c === "All" && <sup>06</sup>}
            </button>
          ))}
        </div>
        <label className="search-box">
          <span className="sr-only">Search experiments</span>
          <input
            placeholder="Find an experiment…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span>⌕</span>
        </label>
      </div>
      <p className="micro result-count" aria-live="polite">
        {filtered.length} EXPERIMENT{filtered.length !== 1 ? "S" : ""}
      </p>
      <div className="library-grid">
        {filtered.map((p) => (
          <Link
            to="/prompts/$slug"
            params={{ slug: p.slug }}
            className={`library-card library-${p.demo}`}
            key={p.slug}
          >
            <div className="library-preview">
              <span className="library-art-mark">
                {
                  (
                    {
                      menu: "☰",
                      ascii: ".:*#",
                      orb: "◉",
                      magnetic: "↗",
                      type: "Aa",
                      orbital: "◎",
                    } as Record<string, string>
                  )[p.demo]
                }
              </span>
              <span className="library-card-arrow">↗</span>
              <small>REVEILLE / EXPERIMENT</small>
            </div>
            <div className="library-caption">
              <h2>{p.title}</h2>
              <span>{p.category}</span>
            </div>
            <p>{p.description}</p>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="no-results">
          <h2>No signals found.</h2>
          <p>Try another search or reset the filters.</p>
          <button
            className="pill-button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Reset filters ↗
          </button>
        </div>
      )}
    </main>
  );
}
