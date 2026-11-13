"use strict";
window.onload = function (ev) {
    let form_img_upload = document.getElementById('form-upload-img');
    let img_uploaded = document.getElementById('img-uploaded');
    console.log("HEEEELP");
    form_img_upload.onchange = function (ev) {
        let files = form_img_upload.files;
        console.log(files);
        if (files !== null) {
            let url = window.URL.createObjectURL(files[0]);
            img_uploaded.src = url;
        }
    };
};
