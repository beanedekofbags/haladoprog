from flask import Flask
from flask import render_template as template
from flask import request
from vision import waitForValue

app = Flask(__name__)

@app.get('/')
def index():
    return template("index.html")