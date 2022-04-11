FROM python:3.6.13-stretch

WORKDIR /code

COPY tensorflow-1.3.0-cp36-cp36m-manylinux1_x86_64.whl /code/

COPY app.py /code/

ADD detector /code/detector

ADD data /code/data

COPY requirements.txt /code/

RUN pip install tensorflow-1.3.0-cp36-cp36m-manylinux1_x86_64.whl 

RUN pip install -r requirements.txt

RUN apt-get update

RUN apt-get install ffmpeg libsm6 libxext6  -y

WORKDIR /code/detector

CMD ["python", "detector.py", "test" ,"--dataset=../data" ,"--model=taco20220406T0732", "--round", "3", "--class_map=./taco_config/map_10.csv"]

#CMD ["python", "app.py"]
