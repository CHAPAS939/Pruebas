import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { prompts } from "../lib/prompts";
import { PromptDemo } from "../components/portfolio/PromptDemo";
export function PromptPage() {
  const { slug } = useParams({ strict: false });
  const prompt = prompts.find((p) => p.slug === slug);
  const [copied, setCopied] = useState("Copy code ↗");
  if (!prompt)
    return (
      <main id="main" className="section-pad not-found">
        <h1>Experiment not found.</h1>
        <Link to="/library">Back to the library ↗</Link>
      </main>
    );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.code);
      setCopied("Copied ✓");
    } catch {
      setCopied("Select and copy the code below");
    }
  };
  return (
    <main id="main" className="prompt-page section-pad">
      <Link className="micro" to="/library">
        ← ALL EXPERIMENTS
      </Link>
      <div className="prompt-heading">
        <div>
          <span className="micro">{prompt.category} / OPEN EXPERIMENT</span>
          <h1>{prompt.title}</h1>
          <p>{prompt.description}</p>
        </div>
        <span className="prompt-number">0{prompts.indexOf(prompt) + 1}</span>
      </div>
      <PromptDemo demo={prompt.demo} />
      <div className="code-heading">
        <div>
          <h2>Under the surface.</h2>
          <p>A starting point for your next experiment.</p>
        </div>
        <button className="pill-button" onClick={copy} aria-live="polite">
          {copied}
        </button>
      </div>
      <pre className="code-block" tabIndex={0}>
        <code>{prompt.code}</code>
      </pre>
      <div className="prompt-notes">
        <p>
          Original experiment. MIT licensed. Adapt the snippet to your
          application and keep keyboard access, reduced motion, and cleanup in
          mind.
        </p>
        <Link to="/library">Keep exploring ↗</Link>
      </div>
    </main>
  );
}
