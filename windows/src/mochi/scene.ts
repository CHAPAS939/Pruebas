/** Local iframe only: no agent data, credentials or privileged API is exposed to it. */
export interface SceneSettings {
  state: string; paused: boolean; reduceMotion: boolean;
  night?: boolean; rain?: boolean; lamp?: boolean; character?: boolean;
  outfit?: string; theme?: string; plant?: boolean; rug?: boolean;
  perched?: boolean; emote?: string | null; lookX?: number; lookY?: number;
}

export class MochiScene {
  readonly el: HTMLIFrameElement;
  ready = false;
  private loaded = false;
  private key = "";
  private last: SceneSettings = { state: "idle", paused: true, reduceMotion: false };
  private active = false;
  private readonly listener: (event: MessageEvent) => void;
  onReady?: (ready: boolean) => void;
  onAnchor?: (anchor: { x: number; y: number }) => void;

  constructor(kind: "home" | "perch", label: string) {
    this.el = document.createElement("iframe");
    this.el.className = "mochi-local-scene";
    this.el.title = label;
    this.el.tabIndex = -1;
    this.el.setAttribute("sandbox", "allow-scripts");
    this.el.setAttribute("aria-hidden", "true");
    this.el.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;pointer-events:none";
    this.listener = (event) => {
      if (event.source !== this.el.contentWindow || event.data?.channel !== "coucou-mochi-scene") return;
      if (event.data.event === "loaded") { this.loaded = true; this.key = ""; this.send(); }
      else if (event.data.event === "ready") { this.ready = true; this.onReady?.(true); }
      else if (event.data.event === "fallback") { this.ready = false; this.loaded = false; this.onReady?.(false); }
      else if (event.data.event === "anchor") {
        const a = event.data.anchor;
        if (a && Number.isFinite(a.x) && Number.isFinite(a.y)) this.onAnchor?.({ x: Math.max(0, Math.min(1, a.x)), y: Math.max(0, Math.min(1, a.y)) });
      }
    };
    window.addEventListener("message", this.listener);
    // Lazy load when the app really shows this destination. Hidden cards mount no WebGL.
    this.el.dataset.sceneKind = kind;
  }

  update(settings: SceneSettings) {
    this.last = settings;
    if (!settings.paused && !this.active) {
      this.active = true;
      this.el.src = `/mochi-scenes/index.html?scene=${this.el.dataset.sceneKind}`;
    }
    this.send();
  }

  private send() {
    const key = JSON.stringify(this.last);
    if (!this.loaded || key === this.key) return;
    this.key = key;
    this.el.contentWindow?.postMessage({ channel: "coucou-mochi-scene", event: "update", settings: this.last }, "*");
  }

  dispose() {
    this.update({ ...this.last, paused: true });
    window.removeEventListener("message", this.listener);
    this.el.remove();
  }
}
