import { ImageList } from "./ImageList.js";
export class ImageListWithInput extends ImageList {
    parallaxScale = 3;
    parallaxDistance = 400;
    parallaxEaseAmount = 250;
    flipDuration = 500;
    input;
    label;
    constructor(id, text, multiple = true) {
        super(id, text);
        const htmlInputId = `img-input-${id}`;
        let input = document.createElement('input');
        {
            input.id = htmlInputId;
            input.name = htmlInputId;
            input.type = "file";
            input.accept = ImageList.accepted;
            input.multiple = multiple;
            input.onchange = (ev) => {
                const files = ev.target.files;
                this.setUrls(files);
            };
        }
        let label = document.createElement('label');
        {
            label.htmlFor = htmlInputId;
        }
        this.label = label;
        this.input = input;
        this.imgWrapperOuter.replaceChild(label, this.imgWrapperInner);
        this.label.appendChild(this.imgWrapperInner);
        this.container.appendChild(input);
    }
}
