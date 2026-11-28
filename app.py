from flask import Flask, request
from flask import render_template as template
from src.py.vision import processImages
from src.py.classes.image import ImageInput
from src.py.util import make_error

app = Flask(__name__)

allowed_types = [
    'image/png',
    'image/jpeg',
    'image/webp'
]

@app.get('/')
def index():
    return template("index.html")

@app.post('/api/vision')
def vision():
    try:
        files = request.files
        desc = request.form['img-desc']
        print(files)

        if (not desc):
            return make_error(400, description='Leírás megadása kötelező!')
        
        img1 = request.files.getlist('img-input-1')
        img2 = request.files.getlist('img-input-2')

        print(img1)

        if (not img1[0].filename) or (not img2[0].filename):
            return make_error(400, description='Nincsen megadva elegendő kép!')

        filetype_img1 = any(i.content_type not in allowed_types for i in img1)
        filetype_img2 = any(i.content_type not in allowed_types for i in img2)
        if filetype_img1 or filetype_img2:
            return make_error(422, description='Hibás képformátum!')
        
        return processImages(
            [ImageInput(img.stream.read(), img.filename) for img in img1],
            [ImageInput(img.stream.read(), img.filename) for img in img2],
            desc
        )
    except Exception as e:
        print(repr(e))
        make_error(500, description='Váratlan hiba történt!')

    #teszt értékek
        
        #results = []
        #for img in img2:
        #    results.append(
        #        { "name": img.filename, "results": { "confidence": 78, "count": 99 } }
        #    )
        #return {
        #    "message": f"{results}",
        #    "result": results
        #}
        
if __name__ == '__main__':
    app.run(port=5000)