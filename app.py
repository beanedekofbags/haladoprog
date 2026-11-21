from flask import Flask, request, abort
from flask import render_template as template
from src.py.vision import processImages
from src.py.classes.image import ImageInput

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
    files = request.files
    print(files)
    if ('img-input-1' not in files) or ('img-input-2' not in files):
        return {
            "error": "Incorrect form model!"
        }
    
    img1 = request.files.getlist('img-input-1')
    img2 = request.files.getlist('img-input-2')

    print(img1)

    if not img1[0].filename or not img2[0].filename:
        return {
            "error": "Not enough images provided!"
        }

    filetype_img1 = any(i.content_type not in allowed_types for i in img1)
    filetype_img2 = any(i.content_type not in allowed_types for i in img2)
    if filetype_img1 or filetype_img2:
        return {
            "error": "Incorrect file type(s)!"
        }
    
    return processImages(
        [ImageInput(img.stream.read(), img.filename) for img in img1],
        [ImageInput(img.stream.read(), img.filename) for img in img2]
    )