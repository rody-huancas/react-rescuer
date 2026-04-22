import type { Breadcrumb, BreadcrumbType } from "../core/types";

type BreadcrumbInput = Omit<Breadcrumb, "timestamp"> & { timestamp?: number };

function now() {
  return Date.now();
}

function pushWithLimit<T>(arr: T[], item: T, limit: number) {
  arr.push(item);
  while (arr.length > limit) arr.shift();
}

function elementDescriptor(el: Element) {
  const tag = el.tagName.toLowerCase();
  const id  = el.id ? `#${el.id}` : "";
  const cls = el.classList.length ? `.${Array.from(el.classList).slice(0, 3).join(".")}` : "";

  return `${tag}${id}${cls}`;
}

function isBreadcrumbType(value: unknown): value is BreadcrumbType {
  return value === "click" || value === "navigation" || value === "custom";
}

export class BreadcrumbTrail {
  private items: Breadcrumb[] = [];
  private started             = false;
  private max                 = 20;

  private onClick = (e: MouseEvent) => {
    const target = e.target;
    
	if (!(target instanceof Element)) return;

    this.add({
      type   : "click",
      message: elementDescriptor(target),
      data   : {
        x: typeof e.clientX === "number" ? e.clientX : undefined,
        y: typeof e.clientY === "number" ? e.clientY : undefined,
      },
    });
  };

  private onPopState = () => {
    this.add({
      type   : "navigation",
      message: `${location.pathname}${location.search}${location.hash}`,
    });
  };

  private onReset = () => {
    this.clear();
  };

  private originalPushState   : History["pushState"] 	| null = null;
  private originalReplaceState: History["replaceState"] | null = null;

  start() {
    if (this.started) return;
    this.started = true;
    if (typeof window === "undefined") return;

    window.addEventListener("click", this.onClick, true);
    window.addEventListener("popstate", this.onPopState);
    window.addEventListener("react-rescuer:reset", this.onReset as EventListener);

    this.originalPushState    = history.pushState.bind(history);
    this.originalReplaceState = history.replaceState.bind(history);

    const trail = this;

    history.pushState = ((...args: Parameters<History["pushState"]>) => {
      trail.originalPushState?.(...args);
      trail.add({
        type   : "navigation",
        message: `${location.pathname}${location.search}${location.hash}`,
      });
    }) as History["pushState"];
	
    history.replaceState = ((...args: Parameters<History["replaceState"]>) => {
      trail.originalReplaceState?.(...args);
      trail.add({
        type   : "navigation",
        message: `${location.pathname}${location.search}${location.hash}`,
      });
    }) as History["replaceState"];
  }

  stop() {
    if (!this.started) return;
    this.started = false;
    if (typeof window === "undefined") return;

    window.removeEventListener("click", this.onClick, true);
    window.removeEventListener("popstate", this.onPopState);
    window.removeEventListener("react-rescuer:reset", this.onReset as EventListener);

    if (this.originalPushState) history.pushState = this.originalPushState;
    if (this.originalReplaceState) history.replaceState = this.originalReplaceState;

    this.originalPushState = null;
    this.originalReplaceState = null;
  }

  add(input: BreadcrumbInput) {
    const breadcrumb: Breadcrumb = {
      type     : isBreadcrumbType(input.type) ? input.type: "custom",
      timestamp: input.timestamp ?? now(),
    };
    
	if (input.message !== undefined) {
	  breadcrumb.message = input.message;
	}

    if (input.data !== undefined) {
	  breadcrumb.data = input.data;
	}

    pushWithLimit(this.items, breadcrumb, this.max);
  }

  get() {
    return [...this.items];
  }

  clear() {
    this.items = [];
  }
}

let singleton: BreadcrumbTrail | null = null;

export function getBreadcrumbTrail() {
  if (!singleton) {
    singleton = new BreadcrumbTrail();
    singleton.start();
  }
  return singleton;
}

export function addBreadcrumb(input: BreadcrumbInput) {
  getBreadcrumbTrail().add(input);
}
