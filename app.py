from flask import Flask
from flask import render_template as template

app = Flask(__name__)

@app.route('/')
def index():
    return template("index.html")