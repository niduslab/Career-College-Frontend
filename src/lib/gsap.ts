import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let gsapReady = false;

export function prepareGsap(): void {
  if (gsapReady) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsapReady = true;
}

export { gsap };
