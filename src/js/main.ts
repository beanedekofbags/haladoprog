import { get } from "./util/html.js";
import { ImageListWithInput } from "./classes/ImageListWithInput.js";
import easings from "./util/easings.js";
import { ArrowButton } from "./classes/ArrowButton.js";
import { ImageList } from "./classes/ImageList.js";
import { TimeoutAnimation } from "./classes/TimeoutAnimation.js";

let errorAnim: { [id: string]: Animation } = {}
let throbberAnim: Animation | undefined;
let resultAnim: { [id: string]: Animation } = {}

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
    
    let imageSearchResult: Array<any> | null;
    
    let btnResults = new ArrowButton(-90);
    btnResults.toggle(false);
    btnResults.create(get('btn-results-wrapper')!);
    
    let resultsBox = get('results-box')!;
    resultsBox.classList.toggle('invisible', true);
    
    let confidenceValue = get('confidence-value')!;
    let countValue = get('count-value')!;
    
    let img3 = new ImageList(3, 'Nincs megjelenítendő kép').create(get('results-img-wrapper')!);
    img3.container.classList.add('small')
    
    let imgTitle = get('img-title') as HTMLSpanElement;
    
    let btnDownload = get('btn-download') as HTMLAnchorElement;
    
    window.onmousemove = function(ev: MouseEvent) {
        img1.moveWithCursor(ev);
        img2.moveWithCursor(ev);
        img3.moveWithCursor(ev);
    }
    
    let visitedResults: Array<number> = [];
    
    uploadForm.onsubmit = (ev: SubmitEvent) => {
        ev.preventDefault();
        
        let formData = new FormData(uploadForm)
        imgSubmit.value = ''
        imgSubmit.disabled = true;
        imgSubmit.classList.remove('error');
        loading.classList.toggle('invisible', false);
        txtError.classList.toggle('invisible', true);
        
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
           "body": formData
        })
           .then(res => {
                if (res.ok)
                    return res.json();
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
                    imgSubmit.classList.add('error');
                }
                else {
                    btnResults.toggle(true);
                }
                txtError.textContent = json.message ?? json.error ?? '';
                
                if (json.data) {
                    imageSearchResult = json.data;
                    
                    let formImgs = formData.getAll('img-input-2');
                    img3.setUrls(<Array<File>>(formImgs));
                    
                    visitedResults = [];
                    if (btnResultsOn) {
                        animateResults(imageSearchResult![img3.page], img3.page);
                    }
                    
                    // letöltés
                    let blob = new Blob([JSON.stringify(imageSearchResult, null, 2)], { type: "application/json" });
                    let blobUrl = window.URL.createObjectURL(blob);
                    btnDownload.href = blobUrl;
                    btnDownload.download = 'results.json';
                }
                if (imageSearchResult === null || imageSearchResult?.length === 0) {
                    btnResultsOn = false;
                    resultsToggle();
                }
                
                txtError.classList.toggle('invisible', false);
                
                throbberAnim?.cancel()
                throbberAnim = loading.animate([
                    { transform: 'scale(0%)', offset: 1.0 }
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
    let paddingTop = resultsBox.style.paddingTop;
    let paddingBottom = resultsBox.style.paddingBottom;
    
    let countUpFromZero = (anim: TimeoutAnimation, element: HTMLElement, max: number, format: string) => {
        anim.setAnimation((f) => {
            let f2 = 1 - (1-f)**3; // cubic-out
            let num = Math.round(max * f2);
            let text = format.replaceAll('$', `${num}`);
            element.textContent = text;
        });
    }
    
    let confidence = new TimeoutAnimation();
    let count = new TimeoutAnimation();
    let animateResults = (r: any, page: number) => {
        if (!visitedResults.includes(page)) {
            let duration = 1600;
            confidence.cancel();
            count.cancel();
            countUpFromZero(confidence, confidenceValue, r.results.confidence, '$%');
            countUpFromZero(count, countValue, r.results.count, '$ db');
            confidence.animate(duration, 32);
            count.animate(duration/2, 24);
            visitedResults.push(page);
        }
        else {
            confidence.cancel();
            count.cancel();
            confidenceValue.textContent = `${r.results.confidence}%`;
            countValue.textContent = `${r.results.count} db`;
        }
    }
    
    img3.container.addEventListener("flipped", () => {
        console.log(imageSearchResult);
        console.log(img3.page);
        let r = imageSearchResult![img3.page];
        imgTitle.textContent = `${r.name}`
        animateResults(r, img3.page);
    })
    
    let resultsToggle = () => {
        btnResults.setDirection(btnResultsOn ? 90 : -90);
        
        resultAnim['height'] = resultsBox.animate([
            { paddingTop: `${btnResultsOn ? paddingTop : 0}px`, offset: 1.0 },
            { paddingBottom: `${btnResultsOn ? paddingBottom : 0}px`, offset: 1.0 },
            { gridTemplateRows: `${btnResultsOn ? 1 : 0}fr`, offset: 1.0 }
        ], {
            duration: 500,
            easing: easings.exponential.out,
            fill: "forwards"
        });
        resultAnim['fade'] = resultsBox.animate([
            { opacity: `${btnResultsOn ? 100 : 0}%`, offset: 1.0 },
        ], {
            duration: 500,
            easing: btnResultsOn ? easings.exponential.out : easings.exponential.in,
            fill: "forwards"
        });
        
        if (btnResultsOn) {
            resultsBox.classList.toggle('invisible', false);
            let r = imageSearchResult![img3.page];
            imgTitle.textContent = `${r.name}`
            animateResults(r, img3.page);
        }
        else {
            resultAnim['fade'].onfinish = () => {
                resultsBox.classList.toggle('invisible', true);
            }
        }
    }
    btnResults.button.onclick = () => {
        btnResultsOn = !btnResultsOn && imageSearchResult !== null; // kikapcsolva marad ha nincs adat
        resultsToggle();
    };
}