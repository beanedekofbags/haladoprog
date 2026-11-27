export class TextAnimation {
    timeoutIds = [];
    animation = () => { };
    setAnimation(animation) {
        this.animation = animation;
    }
    cancel() {
        this.timeoutIds.forEach((x) => clearTimeout(x));
    }
    animate(duration, resolution, timing = 0) {
        let f = duration === 0 ? 1 : timing / duration;
        this.animation(f);
        if (timing <= duration) {
            this.timeoutIds.push(setTimeout(() => {
                this.animate(duration, resolution, timing + (duration / resolution));
            }, duration / resolution));
        }
    }
}
