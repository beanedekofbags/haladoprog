// az osztály neve ellenére konkrétan csak szöveg "animálására" használom
export class TimeoutAnimation {
    
    private ids: number[] = [];
    private animation: (f: number)=>void = () => {};
    
    public setAnimation(animation: (f: number)=>void) {
        this.animation = animation;
    }
    
    public cancel() {
        this.ids.forEach((x) => clearTimeout(x));
    }
    
    public animate(duration: number, resolution: number, timing: number = 0) {
        let f = duration === 0 ? 1 : timing / duration;
        this.animation(f);
        if (timing <= duration) {
            this.ids.push(
                setTimeout(() => {
                    this.animate(duration, resolution, timing + (duration / resolution))
                }, duration / resolution)
            );
        }
    }
    
}