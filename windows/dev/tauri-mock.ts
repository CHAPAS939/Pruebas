// A stand-in for Tauri in a plain browser, for the dev previews: every command
// answers from `answers` (or null), events can be fired with window.__emit.
// Not shipped in the app.
const listeners = new Map<number, {event:string;fn:(e:unknown)=>void}>();
let nextListener=0;
const answers: Record<string, unknown> = (window as any).__answers ?? {};
let cb = 0;
(window as any).__TAURI_INTERNALS__ = {
  transformCallback: (callback: (e: unknown) => void) => {
    const id = ++cb;
    (window as any)[`_${id}`] = callback;
    return id;
  },
  invoke: async (cmd: string, args: any) => {
    if (cmd === "plugin:event|listen") {
      const fn = (window as any)[`_${args.handler}`] ?? args.handler;
      const id=++nextListener;listeners.set(id,{event:args.event,fn});
      return id;
    }
    if (cmd === "plugin:event|unlisten") {listeners.delete(args.eventId);return null;}
    const a = answers[cmd];
    if (typeof a === "function") return (a as any)(args);
    return a ?? null;
  },
  metadata: { currentWindow: { label: "hub" }, currentWebview: { label: "hub", windowLabel: "hub" } },
};
(window as any).__emit = (event: string, payload: unknown) => [...listeners.entries()].filter(([,entry])=>entry.event===event).forEach(([id,entry])=>entry.fn({event,id,payload}));
