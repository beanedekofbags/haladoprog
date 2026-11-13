"use strict";
function get(id) {
    return document.getElementById(id);
}
window.onload = function () {
    let imginput_1 = get('img-input-1');
    let img_1 = get('img-1');
    img_1.classList.add('inactive');
    let imginput_2 = get('img-input-2');
    let img_2 = get('img-2');
    img_2.classList.add('inactive');
    const display_image = function (input, img) {
        let files = input.files;
        if (files !== null) {
            let url = window.URL.createObjectURL(files[0]);
            img.classList.remove('inactive');
            img.src = url;
        }
        else {
            img.classList.add('inactive');
        }
    };
    imginput_1.onchange = () => display_image(imginput_1, img_1);
    imginput_2.onchange = () => display_image(imginput_2, img_2);
};
