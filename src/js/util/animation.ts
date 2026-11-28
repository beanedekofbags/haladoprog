import { TimeoutAnimation } from "../classes/TimeoutAnimation";

export let countUpFromZero = (anim: TimeoutAnimation, element: HTMLElement, max: number, format: string) => {
    anim.setAnimation((f) => {
        let f2 = 1 - (1-f) ** 3; // cubic-out
        let num = Math.round(max * f2);
        let text = format.replaceAll('$', `${num}`);
        element.textContent = text;
    });
}