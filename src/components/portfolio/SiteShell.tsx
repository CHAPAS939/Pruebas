import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "../../lib/site-config";
export function SiteShell() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [path]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="Reveille home">
          reveille<span>®</span>
        </Link>
        <div className="header-center">
          <span className="status-dot" /> INDEPENDENT BY DESIGN
        </div>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="/#work">
            Work <sup>11</sup>
          </a>
          <Link to="/library">
            Library <span>↗</span>
          </Link>
          <a href="/#contact">
            Let’s talk <span>↗</span>
          </a>
        </nav>
        <button
          className="menu-toggle"
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          Menu <span>☰</span>
        </button>
      </header>
      <dialog
        ref={dialog}
        className="mobile-menu"
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false);
        }}
      >
        <div className="mobile-menu-inner">
          <div className="menu-top">
            <span>reveille®</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              Close ×
            </button>
          </div>
          <nav aria-label="Mobile navigation">
            <a href="/#work" onClick={() => setOpen(false)}>
              Work ↗
            </a>
            <Link to="/library">Library ↗</Link>
            <a href="/#contact" onClick={() => setOpen(false)}>
              Let’s talk ↗
            </a>
          </nav>
          <span className="micro">A LITTLE LESS ORDINARY.</span>
        </div>
      </dialog>
      <Outlet />
      <div className="site-bottom">
        <span>
          © {new Date().getFullYear()} {siteConfig.name} Creative
        </span>
        <div>
          <Link to="/legal">Legal</Link>
          <Link to="/privacy">Privacy</Link>
          <a href={siteConfig.github}>Source ↗</a>
        </div>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
    </>
  );
}
