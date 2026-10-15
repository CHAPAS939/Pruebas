import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function useMotion(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!root.current) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(
            ".hero-curtain",
            { clipPath: "inset(0 0 100% 0)", duration: 1.3 },
            0,
          )
          .from(
            ".hero-title > span",
            {
              yPercent: 110,
              rotate: 5,
              clipPath: "inset(0 0 100% 0)",
              stagger: 0.12,
              duration: 1.2,
            },
            0.15,
          )
          .from(
            ".hero-object",
            { rotate: -35, scale: 0.65, y: 90, duration: 1.8 },
            0.1,
          )
          .from(
            ".hero-meta > *",
            { opacity: 0, y: 16, stagger: 0.08, duration: 0.7 },
            0.7,
          );
        gsap
          .timeline({
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          })
          .to(".hero-title .line-one", { xPercent: -16, ease: "none" }, 0)
          .to(".hero-title .line-two", { xPercent: 14, ease: "none" }, 0)
          .to(
            ".hero-object",
            { yPercent: 25, rotate: 35, scale: 0.8, ease: "none" },
            0,
          )
          .to(".hero-bottom", { y: 70, opacity: 0 }, 0);
        gsap.fromTo(
          ".about-word",
          { color: "#b7b8ae" },
          {
            color: "#1a1d17",
            stagger: 0.18,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-statement",
              start: "top 80%",
              end: "bottom 40%",
              scrub: true,
            },
          },
        );
        gsap.from(".about-orbit", {
          rotate: -90,
          scale: 0.6,
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.utils.toArray<HTMLElement>(".project").forEach((project, i) => {
          gsap.fromTo(
            project.querySelector(".project-art"),
            { clipPath: "inset(12% 0 12% 0)", scale: 0.94 },
            {
              clipPath: "inset(0% 0 0% 0)",
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: project,
                start: "top 90%",
                end: "top 30%",
                scrub: 0.6,
              },
            },
          );
          gsap.fromTo(
            project.querySelector(".project-visual"),
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: project,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
              },
            },
          );
          gsap.from(project.querySelector(".project-caption"), {
            x: i % 2 ? -24 : 24,
            opacity: 0,
            scrollTrigger: {
              trigger: project,
              start: "bottom 98%",
              toggleActions: "play none none reverse",
            },
          });
        });
        gsap.from(".feed", {
          clipPath: "inset(0 0 100% 0)",
          stagger: 0.07,
          duration: 0.8,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: ".feed-grid",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        gsap.utils
          .toArray<HTMLElement>(".faq-item")
          .forEach((el) =>
            gsap.from(el, {
              x: 35,
              opacity: 0,
              duration: 0.5,
              scrollTrigger: {
                trigger: el,
                start: "top 95%",
                toggleActions: "play none none reverse",
              },
            }),
          );
        gsap.fromTo(
          ".footer-title",
          { yPercent: 45, rotate: -4 },
          {
            yPercent: 0,
            rotate: 0,
            scrollTrigger: {
              trigger: ".footer",
              start: "top bottom",
              end: "bottom bottom",
              scrub: 1,
            },
          },
        );
      });
      mm.add(
        {
          desktop: "(min-width: 900px)",
          mobile: "(max-width: 899px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (!context.conditions?.motion) return;
          const desktop = context.conditions.desktop;
          const section = root.current?.querySelector(".design-section");
          const design = root.current?.querySelector(
            '[data-design-word="design"]',
          );
          const code = root.current?.querySelector('[data-design-word="code"]');
          const amp = root.current?.querySelector("[data-design-amp]");
          if (!section || !design || !code || !amp) return;
          gsap
            .timeline({
              scrollTrigger: {
                id: "design-code",
                trigger: section,
                start: "top top",
                end: desktop ? "+=160%" : "+=75%",
                pin: true,
                scrub: 0.65,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              design,
              { xPercent: -22 },
              { xPercent: 18, ease: "none" },
              0,
            )
            .fromTo(code, { xPercent: 24 }, { xPercent: -22, ease: "none" }, 0)
            .fromTo(
              amp,
              { rotate: -70, scale: 0.5, rotationY: -40 },
              { rotate: 45, scale: 1.15, rotationY: 35, ease: "none" },
              0,
            )
            .fromTo(
              ".design-note",
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.2 },
              0.65,
            );
        },
      );
    }, root);
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [root]);
}
