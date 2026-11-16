function get(id: string): HTMLElement | null {
    return document.getElementById(id);
}

class ImageSelector {
    
    private static accepted = 'image/png,image/jpeg,image/webp'
    
    public input: HTMLInputElement;
    public imgFront: HTMLImageElement;
    private imgBack: HTMLImageElement;
    private container: HTMLDivElement;
    
    public constructor(id: Number) {
        let htmlId = `img-input-${id}`
        
        let input = document.createElement('input');
            input.id = htmlId;
            input.name = htmlId;
            input.type = "file";
            input.accept = ImageSelector.accepted;
        this.input = input;
        
        let imgFront = document.createElement('img');
            imgFront.id = `img-${id}`
            imgFront.classList.add('img-front');
            imgFront.classList.add('inactive');
        this.imgFront = imgFront;
            
        let imgBack = document.createElement('img');
        this.imgBack = imgBack;
        
        let blurParent = document.createElement('div');
            blurParent.classList.add('img-back');
            blurParent.classList.add('inactive');
            blurParent.appendChild(this.imgBack);
        
        let label = document.createElement('label');
            label.htmlFor = htmlId;
            label.classList.add('img-container');
            label.appendChild(this.imgFront);
            label.appendChild(blurParent);
            
        let container = document.createElement('div');
            container.classList.add('upload-field');
            container.appendChild(label);
            container.appendChild(this.input);
        this.container = container;
    }
    
    public create(parent: Node): ImageSelector {
        parent.appendChild(this.container);
        return this;
    }
    
    public setImg(src: string | null) {
        src = src ?? '';
        this.imgFront.src = src;
        this.imgBack.src = src;
        let toggle = (src == '');
        this.imgFront.classList.toggle('inactive', toggle);
        this.imgBack.parentElement!.classList.toggle('inactive', toggle);
    }
    
}

window.onload = function() {
    
    let response_txt = get('response-txt') as HTMLParagraphElement;
    
    let imgform = get('img-form') as HTMLFormElement;
    let imgmain = get('img-main')!;
    
    /*
    let imginput_1 = get('img-input-1') as HTMLInputElement;
    let img_1 = get('img-1') as HTMLImageElement;
        img_1.classList.add('inactive')
    
    let imginput_2 = get('img-input-2') as HTMLInputElement;
    let img_2 = get('img-2') as HTMLImageElement;
        img_2.classList.add('inactive')
    */
   
    let img1 = new ImageSelector(1).create(imgmain);
    let img2 = new ImageSelector(2).create(imgmain);
    
    const display_image = function(selector: ImageSelector) {
        let files = selector.input.files
        let src = files != null ? window.URL.createObjectURL(files[0]!) : null;
        selector.setImg(src);
    }
    
    img1.input.onchange = () => display_image(img1)
    img2.input.onchange = () => display_image(img2)
    
    imgform.onsubmit = (ev: SubmitEvent) => {
        ev.preventDefault();
        
        let data = new FormData(imgform)
        console.log(data)
        
        fetch('/api/test', {
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
                response_txt.textContent = json.message ?? json.error
           })
    }
}