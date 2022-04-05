FROM python:3.8-slim-buster

WORKDIR /code

COPY app.py /code/

COPY /templates/* /code/templates/

COPY /static/ /code/static/

COPY get_prediction.py /code/

COPY /models/* /code/models/

COPY /images/* /code/images/

COPY ../requirements.txt /code/

RUN pip install -r requirements.txt

CMD ["python", "app.py"]