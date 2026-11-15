function get(id: string): HTMLElement | null {
    return document.getElementById(id);
}

window.onload = function() {
    
    let response_txt = get('response-txt') as HTMLParagraphElement;
    
    let imgform = get('img-form') as HTMLFormElement;
    
    let imginput_1 = get('img-input-1') as HTMLInputElement;
    let img_1 = get('img-1') as HTMLImageElement;
        img_1.classList.add('inactive')
    
    let imginput_2 = get('img-input-2') as HTMLInputElement;
    let img_2 = get('img-2') as HTMLImageElement;
        img_2.classList.add('inactive')
    
    const display_image = function(input: HTMLInputElement, img: HTMLImageElement) {
        let files = input.files
        if (files !== null) {
            let url = window.URL.createObjectURL(files[0]!)
            
            img.classList.remove('inactive')
            img.src = url
        }
        else {
            img.classList.add('inactive')
        }
    }
    
    imginput_1.onchange = () => display_image(imginput_1, img_1)
    imginput_2.onchange = () => display_image(imginput_2, img_2)
    
    imgform.onsubmit = (ev: SubmitEvent) => {
        ev.preventDefault();
        
        let data = new FormData(imgform)
        console.log(data)
        
        fetch('/api/test', {
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
                response_txt.textContent = json.message ?? json.error
           })
    }
}