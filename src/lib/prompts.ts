export const prompts = [
  {
    slug: "menu-icon-morph",
    title: "Menu icon morph",
    category: "Interaction",
    description:
      "Two lines. One satisfying transition. A tiny interaction with a big personality.",
    demo: "menu",
    code: `.menu-line { transition: transform 350ms cubic-bezier(.2,.8,.2,1); }
button[aria-expanded="true"] .menu-line:first-child { transform: translateY(5px) rotate(45deg); }
button[aria-expanded="true"] .menu-line:last-child { transform: translateY(-5px) rotate(-45deg); }
@media (prefers-reduced-motion: reduce) { .menu-line { transition: none; } }`,
  },
  {
    slug: "animated-footer-ascii",
    title: "Animated ASCII footer",
    category: "Typography",
    description:
      "An ever-shifting field of characters. A playful signature for the end of a page.",
    demo: "ascii",
    code: `const glyphs = ['.', ':', '+', '*', '#', '@'];
function frame(time, width = 36, height = 12) {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const wave = Math.sin(x * .3 + time) * Math.cos(y * .4 - time);
      return glyphs[Math.min(5, Math.floor((wave + 1) * 3))];
    }).join('')
  ).join('\\n');
}
// Animate only while visible; respect reduced motion and clear the timer.`,
  },
  {
    slug: "ai-status-orb",
    title: "AI status orb",
    category: "WebGL",
    description:
      "A breathing surface with distinct idle, thinking, and speaking states.",
    demo: "orb",
    code: `// Vertex displacement for a sphere mesh (GLSL)
uniform float uTime;
uniform float uAmplitude;
void main() {
  float wave = sin(position.x * 8. + uTime)
    * sin(position.y * 7. - uTime * .8)
    * sin(position.z * 6. + uTime * .4);
  vec3 p = position + normal * wave * uAmplitude;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}
// idle: amplitude .04 / thinking: .12 / speaking: .20`,
  },
  {
    slug: "magnetic-button",
    title: "Magnetic button",
    category: "Interaction",
    description:
      "A subtle attraction that follows your pointer and settles back into place.",
    demo: "magnetic",
    code: `function attract(event) {
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  el.style.transform = \`translate(\${(event.clientX-box.left-box.width/2)*.2}px, \${(event.clientY-box.top-box.height/2)*.2}px)\`;
}
function reset(event) { event.currentTarget.style.transform = ''; }
// Bind pointermove and pointerleave. Keep the effect disabled for reduced motion.`,
  },
  {
    slug: "kinetic-type",
    title: "Kinetic type",
    category: "Typography",
    description:
      "Oversized letters, opposing directions, and a rhythm controlled by you.",
    demo: "type",
    code: `const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.to('[data-kinetic]', {
    xPercent: -20,
    ease: 'none',
    scrollTrigger: { trigger: '[data-stage]', scrub: true }
  });
});
// Call mm.revert() when the component unmounts.`,
  },
  {
    slug: "orbital-study",
    title: "Orbital study",
    category: "WebGL",
    description:
      "Seven polished rings, a shifting perspective, and a single center of gravity.",
    demo: "orbital",
    code: `for (let i = 0; i < 7; i++) {
  const geometry = new THREE.TorusGeometry(.65 + i * .19, .07, 12, 100);
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.set(i * .3, i * .45, i * .15);
  group.add(ring);
}
// Animate rotation, render while visible, and dispose geometry and materials.`,
  },
];
