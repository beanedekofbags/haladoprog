import easings from "../util/easings.js";
import { ArrowButton } from "./ArrowButton.js"

export class ImageList {
    
    protected static accepted = 'image/png,image/jpeg,image/webp'
    
    public parallaxScale = 3;
    public parallaxDistance = 400;
    public parallaxEaseAmount = 250;
    public flipDuration = 500;
    
    protected missingMessage: HTMLParagraphElement;
    public imgFrontA: HTMLImageElement;
    public imgFrontB: HTMLImageElement;
    protected imgBackWrapper: HTMLDivElement;
    protected imgBack: HTMLImageElement;
    protected arrowL: ArrowButton;
    protected arrowR: ArrowButton;
    protected imgWrapperOuter: HTMLDivElement;
    protected imgWrapperInner: HTMLDivElement;
    protected container: HTMLDivElement;
    
    protected urls: Array<string> = [];
    protected oPage: number = 0;
    protected page: number = 0;
    
    private flipAnimations: { [id: string] : Animation } = {};
    
    public constructor(id: number, text: string) {
        const htmlImgId = `img-${id}`
        
        let missingMessage = document.createElement('p'); {
            missingMessage.textContent = text;
            missingMessage.classList.add('overlay-text');
        }
        
        let imgFrontA = document.createElement('img'); {
            imgFrontA.id = htmlImgId;
            imgFrontA.classList.add('img-front');
            imgFrontA.classList.add('inactive');
            imgFrontA.style.zIndex = '3';
        }
        let imgFrontB = <HTMLImageElement>imgFrontA.cloneNode(); {
            imgFrontB.style.zIndex = '2';
        }
            
        let imgBack = document.createElement('img');
        
        let imgBackWrapper = document.createElement('div'); {
            imgBackWrapper.classList.add('img-back');
            imgBackWrapper.classList.add('inactive');
            imgBackWrapper.style.zIndex = '1';
            imgBackWrapper.appendChild(imgBack);
        }
        
        let imgWrapperInner = document.createElement('div'); {
            imgWrapperInner.classList.add('img-wrapper-inner');
            
            imgWrapperInner.appendChild(missingMessage);
            imgWrapperInner.appendChild(imgFrontA);
            imgWrapperInner.appendChild(imgFrontB);
            imgWrapperInner.appendChild(imgBackWrapper);
        }
        
        let imgWrapperOuter = document.createElement('div'); {
            imgWrapperOuter.classList.add('img-wrapper-outer');
            
            imgWrapperOuter.appendChild(imgWrapperInner);
        }
        
        let arrowL = new ArrowButton(0); {
            arrowL.button.classList.add('h');
            arrowL.button.onclick = () => this.offsetPage(-1)
        }
        let arrowR = new ArrowButton(180); {
            arrowR.button.classList.add('h');
            arrowR.button.onclick = () => this.offsetPage(1)
        }
            
        let container = document.createElement('div'); {
            container.classList.add('imglist-container');
            
            container.appendChild(arrowL.container);
            container.appendChild(imgWrapperOuter);
            container.appendChild(arrowR.container);
        }
        
        this.missingMessage = missingMessage;
        
        this.imgFrontA = imgFrontA;
        this.imgFrontB = imgFrontB;
        this.imgBackWrapper = imgBackWrapper
        this.imgBack = imgBack;
        
        this.arrowL = arrowL;
        this.arrowR = arrowR;
        
        this.imgWrapperInner = imgWrapperInner;
        this.imgWrapperOuter = imgWrapperOuter;
        this.container = container;
        this.updateArrows();
    }
    
    public setUrls(imgs: Array<string> | FileList | null) {
        this.urls = [];
        if (imgs?.length) {
            for (let i = 0; i < imgs.length; i++) {
                let url = '';
                if (imgs instanceof FileList) {
                    url = window.URL.createObjectURL(imgs.item(i)!)
                }
                else {
                    url = this.urls[i]!;
                }
                this.urls.push(url);
            }
        }
        this.page = 0;
        this.updateImg();
        this.animateFlip(0);
        this.updateArrows();
    }
    
    public create(parent: Node): ImageList {
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
    
    private updateArrows() {
        let max = this.urls?.length ?? 1;
        this.arrowL.toggle(this.page > 0);
        this.arrowR.toggle(this.page < max-1);
    }
    
    private updateImg() {
        let url = this.urls[this.page];
        let oUrl = this.urls[this.oPage];
        
        this.imgBack.src = this.imgFrontA.src = url ?? '';
        this.imgFrontB.src = oUrl ?? '';
        
        let toggle = url === undefined;
        this.missingMessage.classList.toggle('inactive', !toggle);
        this.imgFrontA.classList.toggle('inactive', toggle);
        this.imgBack.parentElement!.classList.toggle('inactive', toggle);
    }
    
    private animateFlip(direction: number = 0) {
        if (direction !== 0) {
            const distance = this.container.getBoundingClientRect().width;
            
            this.imgFrontB.classList.toggle('inactive', false);
            
            this.flipAnimations['flip-main']?.cancel();
            this.flipAnimations['flip-alt']?.cancel();
            
            this.flipAnimations['flip-main'] = this.imgFrontA.animate([
                { transform: `translateX(${ direction > 0 ? distance : -distance }px)`, offset: 0 },
                { transform: `translateX(0%)`, offset: 1 }
            ], {
                duration: this.flipDuration,
                easing: easings.exponential.out
            })
            
            let flipAlt = this.flipAnimations['flip-alt'] = this.imgFrontB.animate([
                { transform: `translateX(0%)`, offset: 0 },
                { transform: `translateX(${ direction > 0 ? -distance : distance }px)`, offset: 1 }
            ], {
                duration: this.flipDuration,
                easing: easings.exponential.out
            })
            flipAlt.onfinish = () => {
                this.imgFrontB.classList.toggle('inactive', true);
            }
        }
        else {
            this.flipAnimations['pop-main']?.cancel();
            this.flipAnimations['pop-main'] = this.imgFrontA.animate([
                { transform: `scale(0.0)`, offset: 0 },
                { transform: `scale(1.0)`, offset: 1 }
            ], {
                duration: this.flipDuration / 2,
                easing: easings.exponential.out
            })
        }
    }
}