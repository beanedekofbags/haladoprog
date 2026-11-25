import { get } from "./util/html.js";
import { ImageListWithInput } from "./classes/ImageListWithInput.js";
import easings from "./util/easings.js";
import { ArrowButton } from "./classes/ArrowButton.js";

let errorAnim: { [id: string]: Animation } = {}
let throbberAnim: Animation | undefined;

const errorAnimDuration = 600;
const throbberPopDuration = 300;

window.onload = function() {
    
    let txtError = get('txt-error') as HTMLParagraphElement;
    txtError.classList.add('invisible');
    
    let uploadForm = get('upload-form') as HTMLFormElement;
    let imgListBox = get('img-list-box')!;
    let imgSubmit = get('form-submit') as HTMLInputElement;
    
    const submitText = imgSubmit.value;
   
    let loading = get('loading')!;
    loading.classList.add('invisible');
    
    let img1 = new ImageListWithInput(1, 'Referenciakép(ek) kiválasztása...').create(imgListBox);
    let img2 = new ImageListWithInput(2, 'Elemzendő kép(ek) kiválasztása...').create(imgListBox);
    
    let imageSearchResult: any | null;
    
    let btnResults = new ArrowButton(-90);
    btnResults.button.classList.add('v');
    btnResults.toggle(false);
    btnResults.create(get('btn-results-wrapper')!);
    
    let resultsBox = get('results-box')!;
    resultsBox.classList.toggle('inactive', true);
    
    let txtResult = get('txt-result') as HTMLParagraphElement;
    
    window.onmousemove = function(ev: MouseEvent) {
        img1.moveWithCursor(ev);
        img2.moveWithCursor(ev);
    }
    
    uploadForm.onsubmit = (ev: SubmitEvent) => {
        ev.preventDefault();
        
        let data = new FormData(uploadForm)
        imgSubmit.value = ''
        imgSubmit.disabled = true;
        loading.classList.toggle('invisible', false);
        txtError.classList.toggle('invisible', true);
        btnResults.toggle(false);
        
        throbberAnim?.cancel();
        throbberAnim = loading.animate([
            { transform: 'scale(0%)', offset: 0 },
            { transform: 'scale(100%)', offset: 1 }
        ], {
            duration: throbberPopDuration,
            easing: easings.exponential.out
        });
        
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
                    
                    errorAnim['tilt'] = imgSubmit.animate([
                        { rotate: '4deg', offset: 0.0 },
                        { rotate: '0deg', offset: 1.0 }
                    ],
                    {
                        duration: errorAnimDuration,
                        easing: easings.bouncy.out
                    });
                    errorAnim['color'] = imgSubmit.animate([
                        { backgroundColor: 'rgb(219, 127, 155)', offset: 1.0 },
                        { borderColor: 'rgb(105, 36, 57)', offset: 1.0 }
                    ],
                    {
                        duration: errorAnimDuration,
                        easing: easings.exponential.out,
                        direction: "reverse"
                    });
                }
                else {
                    btnResults.toggle(true);
                }
                txtError.textContent = json.message ?? json.error ?? '';
                
                if (json.result) {
                    imageSearchResult = json.result
                }
                
                txtError.classList.toggle('invisible', false);
                
                throbberAnim?.cancel()
                throbberAnim = loading.animate([
                    { transform: 'scale(0%)', offset: 1 }
                ], {
                    duration: throbberPopDuration,
                    easing: easings.exponential.in
                })
                throbberAnim.onfinish = () => {
                    loading.classList.toggle('invisible', true);
                    imgSubmit.value = submitText;
                    imgSubmit.disabled = false;
                }
            })
    }
    
    let btnResultsOn = false;
    btnResults.button.onclick = () => {
        btnResultsOn = !btnResultsOn && imageSearchResult !== null; // kikapcsolva marad ha nincs adat
        btnResults.setDirection(btnResultsOn ? 90 : -90);
        resultsBox.classList.toggle('inactive', !btnResultsOn);
        
        if (btnResultsOn) {
            let r = imageSearchResult[0];
            txtResult.textContent = `Name: ${r.name}, Confidence: ${r.results.confidence}, Count: ${r.results.count}`;
        }
    }
}