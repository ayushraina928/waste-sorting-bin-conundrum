from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def home():
    message = "The Flask Shop"
    return render_template('index.html', message=message)

if __name__ == '__main__':
   app.run()