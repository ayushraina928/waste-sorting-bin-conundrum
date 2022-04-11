import os
import time
import json
from numpy import append
import pandas as pd
from os import listdir
from os.path import isfile, join

path = './json_dumps'

print("Writer running")

while(True):
    files = [f for f in listdir(path) if isfile(join(path, f))]
    for file in files:
        data = json.load(open(path+"/"+file))
        #print(data)
        csv_path = ''
        if 'class_or_det' in data:
            if(data['class_or_det'] == 'classification'):
                csv_path = './feedback_csvs/classification.csv'
            else:
                csv_path =  './feedback_csvs/detect.csv'

            try_catch = 0
            try:
                df_mini_data =  pd.read_csv(csv_path)
            except:
                try_catch = 1

            print("new file found, now writing")
            if try_catch == 1:
                df_mini_data = pd.DataFrame.from_dict(data = data, orient='index').T
                df_mini_data.to_csv(csv_path, index=False)

            else:
                df_temp = pd.DataFrame.from_dict(data = data, orient='index').T
                df_mini_data = df_mini_data.append(df_temp, ignore_index=True)
                df_mini_data.to_csv(csv_path,index=False)
            
            os.remove(path+"/"+file)
    time.sleep(3)