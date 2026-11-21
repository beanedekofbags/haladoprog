import { get } from "./util/html.js";
import { ImageSelectorElement } from "./classes/ImageSelectorElement.js";
import easings from "./util/easings.js";

const errorAnim: { [id: string]: Animation } = {}
const errorAnimDuration = 600;

window.onload = function() {
    
    let response_txt = get('response-txt') as HTMLParagraphElement;
    response_txt.classList.add('invisible');
    
    let imgform = get('img-form') as HTMLFormElement;
    let imgsubmit = get('submit-imgs') as HTMLInputElement;
    let imgmain = get('img-main')!;
   
    let loading = get('loading')!;
    loading.classList.add('invisible');
    
    let img1 = new ImageSelectorElement(1, 'Referenciakép(ek) kiválasztása...').create(imgmain);
    let img2 = new ImageSelectorElement(2, 'Elemzendő kép(ek) kiválasztása...').create(imgmain);
    
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
                    
                    errorAnim['tilt']?.cancel();
                    errorAnim['color']?.cancel();
                    
                    errorAnim['tilt'] = imgsubmit.animate([
                        { rotate: '4deg', offset: 0.0 },
                        { rotate: '0deg', offset: 1.0 }
                    ],
                    {
                        duration: errorAnimDuration,
                        easing: easings.bouncy.out
                    });
                    errorAnim['color'] = imgsubmit.animate([
                        { backgroundColor: 'rgb(219, 127, 155)', offset: 1.0 }
                    ],
                    {
                        duration: errorAnimDuration,
                        easing: easings.exponential.out,
                        direction: "reverse"
                    });
                }
                response_txt.textContent = json.message ?? json.error;
                response_txt.classList.toggle('invisible', false);
                loading.classList.toggle('invisible', true);
            })
    }
}