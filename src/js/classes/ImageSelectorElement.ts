import easings from "../util/easings.js";
import { ArrowButtonElement } from "./ArrowButtonElement.js"

export class ImageSelectorElement {
    
    private static accepted = 'image/png,image/jpeg,image/webp'
    
    public parallaxScale = 3;
    public parallaxDistance = 400;
    public parallaxEaseAmount = 250;
    public flipDuration = 500;
    
    public input: HTMLInputElement;
    public imgFront: HTMLImageElement;
    public imgFrontAlt: HTMLImageElement;
    private imgBack: HTMLImageElement;
    private container: HTMLDivElement;
    private message: HTMLParagraphElement;
    private arrowLeft: ArrowButtonElement;
    private arrowRight: ArrowButtonElement;
    
    private urls: Array<string> = [];
    private oPage: number = 0;
    private page: number = 0;
    
    private flipAnimations: { [id: string] : Animation } = {};
    
    public constructor(id: number, text: string, multiple: boolean = true) {
        const htmlInputId = `img-input-${id}`
        const htmlImgId = `img-${id}`
        
        let message = document.createElement('p'); {
            message.textContent = text;
            message.classList.add('overlay-text');
        }
        
        let input = document.createElement('input'); {
            input.id = htmlInputId;
            input.name = htmlInputId;
            input.type = "file";
            input.accept = ImageSelectorElement.accepted;
            input.multiple = multiple;
            
            input.onchange = () => this.initUrls();
        }
        
        let imgFront = document.createElement('img'); {
            imgFront.id = htmlImgId;
            imgFront.classList.add('img-front');
            imgFront.classList.add('inactive');
            imgFront.style.zIndex = '4';
        }
        let imgFrontTemp = <HTMLImageElement>imgFront.cloneNode(); {
            imgFrontTemp.style.zIndex = '3';
        }
            
        let imgBack = document.createElement('img');
        
        let blurParent = document.createElement('div'); {
            blurParent.classList.add('img-back');
            blurParent.classList.add('inactive');
            blurParent.style.zIndex = '1';
            blurParent.appendChild(imgBack);
        }
        
        let label = document.createElement('label'); {
            label.htmlFor = htmlInputId;
            label.classList.add('img-container');
            label.appendChild(message);
            label.appendChild(imgFront);
            label.appendChild(imgFrontTemp);
            label.appendChild(blurParent);
        }
        
        /* 
        let arrowLeft = document.createElement('button'); {
            arrowLeft.type = 'button'
            arrowLeft.classList.add('arrow');
            
            arrowLeft.onclick = () => this.offsetPage(-1);
        }
        
        let arrowRight = document.createElement('button'); {
            arrowRight.type = 'button'
            arrowRight.classList.add('arrow');
            
            arrowRight.onclick = () => this.offsetPage(1);
        }
        */
        let arrowLeft = new ArrowButtonElement(0); {
            arrowLeft.button.onclick = () => this.offsetPage(-1)
        }
        let arrowRight = new ArrowButtonElement(180); {
            arrowRight.button.onclick = () => this.offsetPage(1)
        }
            
        let container = document.createElement('div'); {
            container.classList.add('upload-field');
            
            container.appendChild(arrowLeft.container);
            container.appendChild(label);
            container.appendChild(arrowRight.container);
            
            container.appendChild(input);
        }
        
        this.message = message;
        this.input = input;
        
        this.imgFront = imgFront;
        this.imgFrontAlt = imgFrontTemp;
        this.imgBack = imgBack;
        
        this.arrowLeft = arrowLeft;
        this.arrowRight = arrowRight;
        
        this.container = container;
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
        this.animateFlip(0);
        this.updateArrows();
    }
    
    private updateArrows() {
        let max = this.urls?.length ?? 1;
        this.arrowLeft.container.classList.toggle('enabled', this.page > 0);
        this.arrowRight.container.classList.toggle('enabled', this.page < max-1);
    }
    
    private updateImg() {
        let url = this.urls[this.page];
        let oUrl = this.urls[this.oPage];
        
        this.imgBack.src = this.imgFront.src = url ?? '';
        this.imgFrontAlt.src = oUrl ?? '';
        
        let toggle = url === undefined;
        this.message.classList.toggle('inactive', !toggle);
        this.imgFront.classList.toggle('inactive', toggle);
        this.imgBack.parentElement!.classList.toggle('inactive', toggle);
    }
    
    private animateFlip(direction: number = 0) {
        if (direction !== 0) {
            const distance = this.container.getBoundingClientRect().width;
            
            this.imgFrontAlt.classList.toggle('inactive', false);
            
            this.flipAnimations['flip-main']?.cancel();
            this.flipAnimations['flip-alt']?.cancel();
            
            this.flipAnimations['flip-main'] = this.imgFront.animate([
                { transform: `translateX(${ direction > 0 ? distance : -distance }px)`, offset: 0 },
                { transform: `translateX(0%)`, offset: 1 }
            ], {
                duration: this.flipDuration,
                easing: easings.exponential.out
            })
            
            let flipAlt = this.flipAnimations['flip-alt'] = this.imgFrontAlt.animate([
                { transform: `translateX(0%)`, offset: 0 },
                { transform: `translateX(${ direction > 0 ? -distance : distance }px)`, offset: 1 }
            ], {
                duration: this.flipDuration,
                easing: easings.exponential.out
            })
            flipAlt.onfinish = () => {
                this.imgFrontAlt.classList.toggle('inactive', true);
            }
        }
        else {
            this.flipAnimations['pop-main']?.cancel();
            this.flipAnimations['pop-main'] = this.imgFront.animate([
                { transform: `scale(0.0)`, offset: 0 },
                { transform: `scale(1.0)`, offset: 1 }
            ], {
                duration: this.flipDuration / 2,
                easing: easings.exponential.out
            })
        }
    }
    
    public create(parent: Node): ImageSelectorElement {
        parent.appendChild(this.container);
        return this;
    }
    
    public offsetPage(offset: number) {
        this.setPage(this.page + offset);
    }
    public setPage(page: number) {
        let max = this.urls?.length ?? 1;
        if (page >= 0 && page <= max-1) {
            this.oPage = this.page;
            this.page = page;
            this.updateImg();
            this.animateFlip(page - this.oPage);
            this.updateArrows();
        }
    }
    
    public moveWithCursor(ev: MouseEvent) {
        if (this.imgBack !== undefined) {
            console.log("mouse moved!!!!");
            const rect = this.imgBack.getBoundingClientRect();
            
            const x = ev.pageX; const y = ev.pageY;
            const centerX = rect.x; const centerY = rect.y;
            
            let offsetX = (x - centerX) / this.parallaxDistance * this.parallaxScale;
            let offsetY = (y - centerY) / this.parallaxDistance * this.parallaxScale;
            
            console.log(`x: ${x}, y: ${y}`);
            this.imgBack.animate([
                { translate: `${offsetX}px ${offsetY}px` }
            ], {
                duration: this.parallaxEaseAmount,
                fill: "forwards"
            })
        }
    }
}