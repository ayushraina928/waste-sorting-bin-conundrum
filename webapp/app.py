from flask import Flask, render_template,request,jsonify
import os
import base64
from PIL import Image
from io import BytesIO
import get_prediction

app = Flask(__name__)

@app.route('/')
def home():
    message = "The Flask Shop"
    return render_template('index.html', message=message)

@app.route('/send-image/', methods=['POST'])
def process_json():
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        data = request.json
        url = data['image_data_url']
        if "data:image/jpeg;base64," in url:
            base_string = url.replace("data:image/jpeg;base64,", "")
            decoded_img = base64.b64decode(base_string)
            img = Image.open(BytesIO(decoded_img))

            file_name = "img.jpg"
            img.save("./images/"+file_name, "jpeg")

        # Base64 DATA
        elif "data:image/png;base64," in url:
            base_string = url.replace("data:image/png;base64,", "")
            decoded_img = base64.b64decode(base_string)
            img = Image.open(BytesIO(decoded_img))

            file_name = "img.png"
            img.save("./images/"+file_name, "png")

        pred = get_prediction.get_pred("./images/img.jpg")


        response = jsonify(pred)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    else:
        return 'Content-Type not supported!'

if __name__ == '__main__':
   app.run(host="0.0.0.0",port=6000)