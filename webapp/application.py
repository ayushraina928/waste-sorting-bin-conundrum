from flask import Flask, render_template,request,jsonify
import os
import base64
from PIL import Image
from io import BytesIO
import subprocess
import get_prediction
import json
import uuid
import pandas as pd

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

print(subprocess.run(["bash", "test.sh"],capture_output=True).stdout)

@app.route('/classify')
def classify():
    message = "The Flask Shop"
    return render_template('indexClassifyNew.html', message=message)

@app.route('/')
def detect():
    message = "The Flask Shop"
    return render_template('indexDetectNew.html', message=message)

@app.route('/send-image/', methods=['POST'])
def process_json():
    content_type = request.headers.get('Content-Type')
    uuid_new = str(uuid.uuid4())
    if (content_type == 'application/json'):
        data = request.json
        url = data['image_data_url']
        if "data:image/jpeg;base64," in url:
            base_string = url.replace("data:image/jpeg;base64,", "")
            decoded_img = base64.b64decode(base_string)
            img = Image.open(BytesIO(decoded_img))

            file_name = "img_"+uuid_new+".jpg"
            img.save("./images/"+file_name, "jpeg")
            
            # Image save for feedback loop 
            img.save("./feedback_images/"+file_name, "jpeg")

        # Base64 DATA
        elif "data:image/png;base64," in url:
            base_string = url.replace("data:image/png;base64,", "")
            decoded_img = base64.b64decode(base_string)
            img = Image.open(BytesIO(decoded_img))

            file_name = "img_"+uuid_new+".png"
            img.save("./images/"+file_name, "png")

            # Image save for feedback loop
            img.save("./feedback_images/"+file_name, "png")

        pred = get_prediction.get_pred("./images/"+file_name)
        splitted = pred.split(",")
        dict = {}
        for el in splitted:
            split = el.split(":")
            dict[split[0].strip()] = split[1].strip()
        
        os.remove("./images/"+file_name)
        dict_jsonified = jsonify(dict)

        # dict for feedback loop
        dict_json = {'Image-name': file_name, 'class_or_det':'classification', 'Predic':pred}
        df_mini_data = pd.DataFrame.from_dict(data = dict_json, orient='index').T
        df_mini_data.to_json('./json_dumps/'+uuid_new+'_classification.json',orient='records',lines=True)


        #pred_json['bbox'] = [20,20,200,200]
        response = dict_jsonified
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    else:
        return 'Content-Type not supported!'

@app.route('/detect-object/', methods=['POST'])
def detect_object():
    print("Inside detect object")
    content_type = request.headers.get('Content-Type')
    uuid_new = str(uuid.uuid4())
    if (content_type == 'application/json'):
        data = request.json
        url = data['image_data_url']
        if "data:image/jpeg;base64," in url:
            base_string = url.replace("data:image/jpeg;base64,", "")
            decoded_img = base64.b64decode(base_string)
            img = Image.open(BytesIO(decoded_img))
            print('################')
            print(img.width,img.height) 
            file_name = "img_"+uuid_new+".jpg"
            img.save("./images/"+file_name, "jpeg")

            # Image save for feedback loop
            img.save("./feedback_images/"+file_name, "jpeg")

        # Base64 DATA
        elif "data:image/png;base64," in url:
            base_string = url.replace("data:image/png;base64,", "")
            decoded_img = base64.b64decode(base_string)
            img = Image.open(BytesIO(decoded_img))

            file_name = "img_"+uuid_new+".png"
            img.save("./images/"+file_name, "png")

            # Image save for feedback loop
            img.save("./feedback_images/"+file_name, "png")

        detect = subprocess.run(["bash", "detect.sh", uuid_new],capture_output=True).stdout
        output_json = None
        with open('./images/output_'+uuid_new+'.json') as json_file:
            print('Read json file')
            output_json = json.loads(json.load(json_file))
            print(output_json)
        
        # dict for feedback loop
        dict_json = {'Image-name': file_name, 'class_or_det':'detection', 'Predic':str(output_json)}
        df_mini_data = pd.DataFrame.from_dict(data = dict_json, orient='index').T
        df_mini_data.to_json('./json_dumps/'+uuid_new+'_detection.json',orient='records',lines=True)

        os.remove("./images/"+file_name)
        os.remove('./images/output_'+uuid_new+'.json')

        return jsonify(output_json)

    else:
        return 'Content-Type not supported!'