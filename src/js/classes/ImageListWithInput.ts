import easings from "../util/easings.js";
import { ArrowButton } from "./ArrowButton.js"
import { ImageList } from "./ImageList.js";

export class ImageListWithInput extends ImageList {
    
    public parallaxScale = 3;
    public parallaxDistance = 400;
    public parallaxEaseAmount = 250;
    public flipDuration = 500;
    
    public input: HTMLInputElement;
    protected label: HTMLLabelElement;
    
    public constructor(id: number, text: string, multiple: boolean = true) {
        super(id, text);
        const htmlInputId = `img-input-${id}`
        
        let input = document.createElement('input'); {
            input.id = htmlInputId;
            input.name = htmlInputId;
            input.type = "file";
            input.accept = ImageList.accepted;
            input.multiple = multiple;
            
            input.onchange = (ev: Event) => {
                const files = (<HTMLInputElement>ev.target).files;
                this.setUrls(files);
            }
        }
        
        let label = document.createElement('label'); {
            label.htmlFor = htmlInputId;
            label.classList.add('img-container');
        }
        
        this.label = label;
        this.input = input;
        
        this.container.replaceChild(label, this.imgContainer); // kicsit gagyin néz ki de működik
        this.label.appendChild(this.imgContainer);
        this.container.appendChild(input);
    }
}