import { get } from "./util/html.js";
import { ImageListWithInput } from "./classes/ImageListWithInput.js";
import easings from "./util/easings.js";
import { ArrowButton } from "./classes/ArrowButton.js";
import { ImageList } from "./classes/ImageList.js";
let errorAnim = {};
let throbberAnim;
let resultAnim;
const errorAnimDuration = 600;
const throbberPopDuration = 300;
window.onload = function () {
    let txtError = get('txt-error');
    txtError.classList.add('invisible');
    let uploadForm = get('upload-form');
    let imgListBox = get('img-list-box');
    let imgSubmit = get('form-submit');
    const submitText = imgSubmit.value;
    let loading = get('loading');
    loading.classList.add('invisible');
    let img1 = new ImageListWithInput(1, 'Referenciakép(ek) kiválasztása...').create(imgListBox);
    let img2 = new ImageListWithInput(2, 'Elemzendő kép(ek) kiválasztása...').create(imgListBox);
    let imageSearchResult;
    let btnResults = new ArrowButton(-90);
    btnResults.toggle(false);
    btnResults.create(get('btn-results-wrapper'));
    let resultsBox = get('results-box');
    resultsBox.classList.toggle('inactive', true);
    let img3 = new ImageList(3, 'Nincs megjelenítendő kép').create(get('results-img-wrapper'));
    img3.container.classList.add('small');
    let txtResult = get('txt-result');
    window.onmousemove = function (ev) {
        img1.moveWithCursor(ev);
        img2.moveWithCursor(ev);
        img3.moveWithCursor(ev);
    };
    uploadForm.onsubmit = (ev) => {
        ev.preventDefault();
        let formData = new FormData(uploadForm);
        imgSubmit.value = '';
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
            "body": formData
        })
            .then(res => {
            if (res.ok)
                return res.json();
            return {
                "error": "An unexpected error has occurred!"
            };
        })
            .then(json => {
            if (json.error) {
                errorAnim['tilt']?.cancel();
                errorAnim['color']?.cancel();
                errorAnim['tilt'] = imgSubmit.animate([
                    { rotate: '4deg', offset: 0.0 },
                    { rotate: '0deg', offset: 1.0 }
                ], {
                    duration: errorAnimDuration,
                    easing: easings.bouncy.out
                });
                errorAnim['color'] = imgSubmit.animate([
                    { backgroundColor: 'rgb(219, 127, 155)', offset: 1.0 },
                    { borderColor: 'rgb(105, 36, 57)', offset: 1.0 }
                ], {
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
                imageSearchResult = json.result;
                let formImgs = formData.getAll('img-input-2');
                img3.setUrls((formImgs));
                console.log(formData.getAll('img-input-2'));
            }
            txtError.classList.toggle('invisible', false);
            throbberAnim?.cancel();
            throbberAnim = loading.animate([
                { transform: 'scale(0%)', offset: 1.0 }
            ], {
                duration: throbberPopDuration,
                easing: easings.exponential.in
            });
            throbberAnim.onfinish = () => {
                loading.classList.toggle('invisible', true);
                imgSubmit.value = submitText;
                imgSubmit.disabled = false;
            };
        });
    };
    let btnResultsOn = false;
    let paddingTop = resultsBox.style.paddingTop;
    let paddingBottom = resultsBox.style.paddingBottom;
    img3.container.addEventListener("flipped", () => {
        let r = imageSearchResult[img3.page];
        txtResult.textContent = `Name: ${r.name}, Confidence: ${r.results.confidence}, Count: ${r.results.count}`;
    });
    btnResults.button.onclick = () => {
        btnResultsOn = !btnResultsOn && imageSearchResult !== null; // kikapcsolva marad ha nincs adat
        btnResults.setDirection(btnResultsOn ? 90 : -90);
        resultAnim?.pause();
        resultAnim = resultsBox.animate([
            { paddingTop: `${btnResultsOn ? paddingTop : 0}px`, offset: 1.0 },
            { paddingBottom: `${btnResultsOn ? paddingBottom : 0}px`, offset: 1.0 },
            { gridTemplateRows: `${btnResultsOn ? 1 : 0}fr`, offset: 1.0 },
            { translate: `0 ${btnResultsOn ? 0 : -40}px`, offset: 1.0 }
        ], {
            duration: 500,
            easing: easings.exponential.out,
            fill: "forwards"
        });
        if (btnResultsOn) {
            resultsBox.classList.toggle('inactive', false);
            let r = imageSearchResult[img3.page];
            txtResult.textContent = `Name: ${r.name}, Confidence: ${r.results.confidence}, Count: ${r.results.count}`;
        }
        else {
            resultAnim.onfinish = () => {
                resultsBox.classList.toggle('inactive', true);
            };
        }
    };
};
