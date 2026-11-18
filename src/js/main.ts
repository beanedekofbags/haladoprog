import { easings } from "./easing.js";

function get(id: string): HTMLElement | null {
    return document.getElementById(id);
}

class ImageSelector {
    
    private static maxOffset = 4;
    private static offsetThreshold = 400;
    private static accepted = 'image/png,image/jpeg,image/webp'
    
    public input: HTMLInputElement;
    public imgFront: HTMLImageElement;
    public imgFront2: HTMLImageElement;
    private imgBack: HTMLImageElement;
    private container: HTMLDivElement;
    private message: HTMLParagraphElement;
    private arrowLeft: HTMLButtonElement;
    private arrowRight: HTMLButtonElement;
    
    private urls: Array<string> = [];
    private page: number = 0;
    
    private anim1: Animation | undefined;
    private anim2: Animation | undefined;
    
    public constructor(id: Number, text: string) {
        const htmlInputId = `img-input-${id}`
        const htmlImgId = `img-${id}`
        
        let message = document.createElement('p'); {
            message.textContent = text;
            message.classList.add('overlay-text');
            this.message = message;
        }
        
        let input = document.createElement('input'); {
            input.id = htmlInputId;
            input.name = htmlInputId;
            input.type = "file";
            input.accept = ImageSelector.accepted;
            input.multiple = true;
            this.input = input;
            
            this.input.onchange = () => this.initUrls();
        }
        
        let imgFront = document.createElement('img'); {
            imgFront.id = htmlImgId;
            imgFront.classList.add('img-front');
            imgFront.classList.add('inactive');
            imgFront.style.zIndex = '4';
            this.imgFront = imgFront;
        }
        let imgFront2 = <HTMLImageElement>imgFront.cloneNode(); {
            imgFront2.style.zIndex = '3';
            this.imgFront2 = imgFront2;
        }
            
        let imgBack = document.createElement('img'); {
            this.imgBack = imgBack;
        }
        let blurParent = document.createElement('div'); {
            blurParent.classList.add('img-back');
            blurParent.classList.add('inactive');
            blurParent.style.zIndex = '1';
            blurParent.appendChild(this.imgBack);
        }
        
        let label = document.createElement('label'); {
            label.htmlFor = htmlInputId;
            label.classList.add('img-container');
            label.appendChild(this.message);
            label.appendChild(this.imgFront);
            label.appendChild(this.imgFront2);
            label.appendChild(blurParent);
        }
            
        let arrowLeft = document.createElement('button'); {
            arrowLeft.type = 'button'
            arrowLeft.classList.add('arrow');
            this.arrowLeft = arrowLeft;
            
            this.arrowLeft.onclick = () => this.flipImg(-1);
        }
        
        let arrowRight = document.createElement('button'); {
            arrowRight.type = 'button'
            arrowRight.classList.add('arrow');
            this.arrowRight = arrowRight;
            
            this.arrowRight.onclick = () => this.flipImg(1);
        }
            
        let container = document.createElement('div'); {
            container.classList.add('upload-field');
            container.appendChild(arrowLeft);
            container.appendChild(label);
            container.appendChild(arrowRight);
            container.appendChild(this.input);
            this.container = container;
        }
        
        this.updateArrows();
    }
    
    private initUrls() {
        const files = this.input.files;
        this.urls = [];
        if (files?.length) {
            for (let i = 0; i < files.length; i++) {
                let url = window.URL.createObjectURL(files.item(i)!)
                this.urls.push(url);
            }
        }
        this.page = 0;
        this.updateImg();
        this.updateArrows();
    }
    
    private updateArrows() {
        let max = this.urls?.length ?? 1;
        this.arrowLeft.classList.toggle('enabled', this.page > 0);
        this.arrowRight.classList.toggle('enabled', this.page < max-1);
    }
    
    private updateImg(flip: number = 0) {
        let url = this.urls[this.page];
        let prevUrl = this.urls[this.page-flip];
        
        let toggle = (url === undefined);
        this.message.classList.toggle('inactive', !toggle);
        
        this.imgFront.classList.toggle('inactive', toggle);
        this.imgBack.parentElement!.classList.toggle('inactive', toggle);
        
        if (!toggle) {
            this.imgBack.src = url ?? '';
            if (flip !== 0) {
                const flipDuration = 500;
                const move = this.container.getBoundingClientRect().width;
                
                this.imgFront.src = prevUrl ?? '';
                this.imgFront2.src = url ?? '';
                
                this.anim1?.cancel();
                this.anim2?.cancel();
                
                this.imgFront2.classList.toggle('inactive', false);
                this.anim1 = this.imgFront2.animate([
                    { transform: `translateX(${flip > 0 ? move : -move}px)`, offset: 0 },
                    { transform: `translateX(0%)`, offset: 1.0 }
                ], {
                    duration: flipDuration,
                    easing: easings.exponential.out
                })
                this.anim1.onfinish = () => {
                    this.imgFront.src = url ?? '';
                }
                
                this.anim2 = this.imgFront.animate([
                    { transform: `translateX(0%)`, offset: 0 },
                    { transform: `translateX(${flip == 1 ? -move : move}px)`, offset: 1.0 }
                ], {
                    duration: flipDuration,
                    easing: easings.exponential.out
                })
                this.anim2.onfinish = () => {
                    this.imgFront2.classList.toggle('inactive', true);
                }
            }
            else {
                this.imgFront.src = this.imgBack.src = url ?? '';
            }
        }
    }
    
    public create(parent: Node): ImageSelector {
        parent.appendChild(this.container);
        return this;
    }
    
    public flipImg(offset: number) {
        let max = this.urls?.length ?? 1;
        let newpage = this.page + offset;
        if (newpage >= 0 && newpage <= max-1) {
            this.page = newpage;
            this.updateImg(offset);
            this.updateArrows();
        }
    }
    
    public moveWithCursor(ev: MouseEvent) {
        if (this.imgBack !== undefined) {
            console.log("mouse moved!!!!");
            const rect = this.imgBack.getBoundingClientRect();
            
            const x = ev.screenX; const y = ev.screenY;
            const centerX = rect.x; const centerY = rect.y;
            
            let offsetX = (x - centerX) / ImageSelector.offsetThreshold * ImageSelector.maxOffset;
            let offsetY = (y - centerY) / ImageSelector.offsetThreshold * ImageSelector.maxOffset;
            
            this.imgBack.style.translate = `${offsetX}px ${offsetY}px`
        }
    }
    
}

let errorAnim: { rotate: Animation | undefined, color: Animation | undefined } = {
    rotate: undefined,
    color: undefined
}

window.onload = function() {
    
    let response_txt = get('response-txt') as HTMLParagraphElement;
    response_txt.classList.add('invisible');
    
    let imgform = get('img-form') as HTMLFormElement;
    let imgsubmit = get('submit-imgs') as HTMLInputElement;
    let imgmain = get('img-main')!;
   
    let loading = get('loading')!;
    loading.classList.add('invisible');
    
    let img1 = new ImageSelector(1, 'Referenciakép(ek) kiválasztása...').create(imgmain);
    let img2 = new ImageSelector(2, 'Elemzendő kép(ek) kiválasztása...').create(imgmain);
    
    window.onmousemove = function(ev: MouseEvent) {
        img1.moveWithCursor(ev);
        img2.moveWithCursor(ev);
    }
    
    imgform.onsubmit = (ev: SubmitEvent) => {
        ev.preventDefault();
        
        let data = new FormData(imgform)
        loading.classList.toggle('invisible', false);
        
        fetch('/api/vision', {
           "method": "POST",
           "body": data
        })
           .then(res => {
                if (res.ok)
                    return res.json()
                return {
                    "error": "An unexpected error has occurred!"
                }
            })
           .then(json => {
                if (json.error) {
                    errorAnim.rotate?.cancel();
                    errorAnim.color?.cancel();
                    
                    errorAnim.rotate = imgsubmit.animate([
                        { rotate: '4deg', backgroundColor: '', offset: 0.0 },
                        { rotate: '0deg', offset: 1.0 }
                    ],
                    {
                        duration: 600,
                        easing: easings.bounce.out
                    });
                    const oBackgroundColor = imgsubmit.style.backgroundColor;
                    errorAnim.rotate = imgsubmit.animate([
                        { backgroundColor: 'rgb(219, 127, 155)', offset: 0.0 },
                        { backgroundColor: oBackgroundColor, offset: 1.0 }
                    ],
                    {
                        duration: 600,
                        easing: easings.exponential.out
                    });
                }
                response_txt.textContent = json.message ?? json.error;
                response_txt.classList.toggle('invisible', false);
                loading.classList.toggle('invisible', true);
            })
    }
}