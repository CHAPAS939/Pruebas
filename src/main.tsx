import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Link,
} from "@tanstack/react-router";
import { SiteShell } from "./components/portfolio/SiteShell";
import { Home } from "./routes";
import "@fontsource-variable/manrope";
import "@fontsource/noto-sans-symbols-2/400.css";
import "@fontsource/space-mono/400.css";
import "./styles.css";
const Library = lazy(() =>
  import("./routes/library").then((m) => ({ default: m.Library })),
);
const PromptPage = lazy(() =>
  import("./routes/prompts.$slug").then((m) => ({ default: m.PromptPage })),
);
const rootRoute = createRootRoute({
  component: SiteShell,
  notFoundComponent: () => (
    <main id="main" className="section-pad not-found">
      <h1>Lost in the playground.</h1>
      <Link to="/">Find your way home ↗</Link>
    </main>
  ),
});
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library",
  component: () => (
    <Suspense
      fallback={<main className="route-loading">Opening the library…</main>}
    >
      <Library />
    </Suspense>
  ),
});
const promptRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prompts/$slug",
  component: () => (
    <Suspense
      fallback={<main className="route-loading">Opening experiment…</main>}
    >
      <PromptPage />
    </Suspense>
  ),
});
function Legal({ privacy = false }: { privacy?: boolean }) {
  return (
    <main id="main" className="legal section-pad">
      <Link to="/">← BACK HOME</Link>
      <h1>{privacy ? "Privacy, simply." : "A few particulars."}</h1>
      {privacy ? (
        <>
          <h2>Your visit</h2>
          <p>
            This application does not use analytics, advertising cookies,
            accounts, or a backend database. Searches and demo controls run
            locally in your browser. The hosting provider may process connection
            logs according to its own policies.
          </p>
          <h2>External links</h2>
          <p>
            Links to GitHub leave this website and are governed by that
            service’s privacy policy. The copy button writes only the selected
            experiment snippet to your clipboard when you request it.
          </p>
        </>
      ) : (
        <>
          <h2>An independent creative demo</h2>
          <p>
            Reveille Creative is a concept portfolio. All displayed projects are
            original design studies, not claims of commissioned work. This
            project is not affiliated with Louis Raille or louisraille.fr.
          </p>
          <h2>Code and visual studies</h2>
          <p>
            Original code and procedural visuals are MIT licensed. Manrope and
            Space Mono fonts are distributed under the SIL Open Font License;
            their notices are included with their packages. Third-party
            libraries retain their respective licenses.
          </p>
          <h2>Contact</h2>
          <p>
            For questions about this project, use the repository linked in the
            footer. Production contact details can be supplied by the site
            operator.
          </p>
        </>
      )}
    </main>
  );
}
const legalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal",
  component: () => <Legal />,
});
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: () => <Legal privacy />,
});
const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute,
    libraryRoute,
    promptRoute,
    legalRoute,
    privacyRoute,
  ]),
  defaultPreload: "intent",
  scrollRestoration: true,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
