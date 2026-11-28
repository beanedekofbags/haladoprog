import { ImageList } from "./ImageList.js";

// képnézegető, de bemenettel!!!!
// feltöltéskor automatikusan frissül a képnézegető
export class ImageListWithInput extends ImageList {
    
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
        }
        
        this.label = label;
        this.input = input;
        
        this.imgWrapperOuter.replaceChild(label, this.imgWrapperInner);
        this.label.appendChild(this.imgWrapperInner);
        this.container.appendChild(input);
    }
}