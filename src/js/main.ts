window.onload = function(ev: Event) {
    
    let form_img_upload = document.getElementById('form-upload-img')! as HTMLInputElement;
    let img_uploaded = document.getElementById('img-uploaded')! as HTMLImageElement;
    
    console.log("HEEEELP")
    
    form_img_upload.onchange = function(ev: Event) {
        let files = form_img_upload.files
        console.log(files)
        if (files !== null) {
            let url = window.URL.createObjectURL(files[0]!)
            img_uploaded.src = url
        }
    }
}