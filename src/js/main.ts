import { get } from "./util/html.js";
import { easings } from "./util/easings.js";
import { countUpFromZero } from "./util/animation.js";

import { ImageListWithInput } from "./classes/ImageListWithInput.js";
import { ArrowButton } from "./classes/ArrowButton.js";
import { ImageList } from "./classes/ImageList.js";
import { TimeoutAnimation } from "./classes/TimeoutAnimation.js";

// átvihettem volna ezeket CSS-be de mostmár maradnak itt
let errorAnim: { [id: string]: Animation } = {}
let throbberAnim: Animation | undefined;
let resultAnim: { [id: string]: Animation } = {}

const errorAnimDuration = 600;
const throbberPopDuration = 300;
const resultsShowDuration = 500;
const valueAnimDuration = 1600;

window.onload = function() {
    
    // űrlap rész
    let uploadForm = get('upload-form') as HTMLFormElement;
    let imgListBox = get('img-list-box')!;
    
    // bemenetes
    let img1 = new ImageListWithInput(1, 'Referenciakép(ek) kiválasztása...').create(imgListBox);
    let img2 = new ImageListWithInput(2, 'Elemzendő kép(ek) kiválasztása...').create(imgListBox);
    
    // submit rész
    let txtError = get('txt-error') as HTMLParagraphElement;
    txtError.classList.add('invisible');
    
    let loading = get('loading')!;
    let imgSubmit = get('form-submit') as HTMLInputElement;
    loading.classList.add('invisible');
    
    let imageSearchResult: Array<any> | null;
    
    // eredmény rész
    let btnResults = new ArrowButton(-90); // lenyíló menühöz
    let resultsBox = get('results-box')!;
    btnResults.toggle(false);
    btnResults.create(get('btn-results-wrapper')!);
    resultsBox.classList.toggle('invisible', true);
    
    // eredmény tartalma
    let img3 = new ImageList(3, 'Nincs megjelenítendő kép').create(get('results-img-wrapper')!);
    let imgTitle = get('img-title') as HTMLSpanElement;
    let confidenceValue = get('confidence-value')!;
    let countValue = get('count-value')!;
    let btnDownload = get('btn-download') as HTMLAnchorElement;
    img3.container.classList.add('small')
    
    // eredeti submit szöveg
    const submitText = imgSubmit.value;
    let visitedResults: Array<number> = [];
    
    window.onmousemove = (ev: MouseEvent) => {
        img1.moveWithCursor(ev);
        img2.moveWithCursor(ev);
        img3.moveWithCursor(ev);
    }
    
    uploadForm.onsubmit = async (ev: SubmitEvent) => {
        ev.preventDefault(); // nem valódi submit gomb haha
        
        let formData = new FormData(uploadForm);
        
        // alapállapot
        imgSubmit.value = ''
        imgSubmit.disabled = true;
        imgSubmit.classList.remove('error');
        loading.classList.toggle('invisible', false);
        txtError.classList.toggle('invisible', true);
        
        throbberAnim?.cancel();
        throbberAnim = loading.animate([
            { transform: 'scale(0%)', offset: 0.0 },
            { transform: 'scale(100%)', offset: 1.0 }
        ], {
            duration: throbberPopDuration,
            easing: easings.exponential.out
        });
        
        try {
            // adatok átadása, lekérése
            let res = await fetch(
                '/api/vision', {
                    "method": "POST",
                    "body": formData
                }
            );
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.description);
            }
            
            btnResults.toggle(true);
            if (json.data) {
                imageSearchResult = json.data;
                
                let formImgs = formData.getAll('img-input-2');
                img3.setUrls(<Array<File>>(formImgs));
                
                // animálja az értéket ha már meg van nyitva az eredmény menü
                visitedResults = [];
                if (btnResultsOn) {
                    animateResults(imageSearchResult![img3.page]);
                }
                
                // letöltési link
                let blob = new Blob([JSON.stringify(imageSearchResult, null, 2)], { type: "application/json" });
                let blobUrl = window.URL.createObjectURL(blob);
                btnDownload.href = blobUrl;
                btnDownload.download = 'results.json';
            }
            if (imageSearchResult === null || imageSearchResult?.length === 0) {
                btnResultsOn = false;
                resultsToggle();
            }
        }
        catch (error: any) {
            console.log(error.message);
            
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
            txtError.textContent = error.message;
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
    }
    
    let btnResultsOn = false;
    let paddingTop = resultsBox.style.paddingTop;
    let paddingBottom = resultsBox.style.paddingBottom;
    
    let confidenceAnim = new TimeoutAnimation();
    let countAnim = new TimeoutAnimation();
    
    let animateResults = (r: any) => {
        // már látogatott oldalaknál nem játsza le újra az animációt
        if (!visitedResults.includes(img3.page)) {
            
            // animáció félbeszakítása ...
            confidenceAnim.cancel();
            countAnim.cancel();
            // ... hozzárendelése ...
            countUpFromZero(confidenceAnim, confidenceValue, r.results.confidence, '$%');
            countUpFromZero(countAnim, countValue, r.results.count, '$ db');
            // ... elindítása
            confidenceAnim.animate(valueAnimDuration, 32);
            countAnim.animate(valueAnimDuration / 2, 24);
            
            visitedResults.push(img3.page);
        }
        else {
            confidenceAnim.cancel();
            countAnim.cancel();
            
            confidenceValue.textContent = `${r.results.confidence}%`;
            countValue.textContent = `${r.results.count} db`;
        }
    }
    
    // képek között mozgatáskor meghívja az animációt
    img3.container.addEventListener("flipped", () => {
        let r = imageSearchResult![img3.page];
        imgTitle.textContent = `${r.name}`
        animateResults(r);
    })
    
    let resultsToggle = () => {
        
        btnResults.setDirection(btnResultsOn ? 90 : -90); // irányt vált; szintén megoldhattam volna CSS-el de mostmár így marad
        
        resultAnim['height'] = resultsBox.animate([
            { paddingTop: `${btnResultsOn ? paddingTop : 0}px`, offset: 1.0 },
            { paddingBottom: `${btnResultsOn ? paddingBottom : 0}px`, offset: 1.0 },
            { gridTemplateRows: `${btnResultsOn ? 1 : 0}fr`, offset: 1.0 }
        ], {
            duration: resultsShowDuration,
            easing: easings.exponential.out,
            fill: "forwards"
        });
        
        resultAnim['fade'] = resultsBox.animate([
            { opacity: `${btnResultsOn ? 100 : 0}%`, offset: 1.0 },
        ], {
            duration: resultsShowDuration,
            easing: btnResultsOn ? easings.exponential.out : easings.exponential.in,
            fill: "forwards"
        });
        
        if (btnResultsOn) {
            resultsBox.classList.toggle('invisible', false);
            let r = imageSearchResult![img3.page];
            imgTitle.textContent = `${r.name}`
            animateResults(r);
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