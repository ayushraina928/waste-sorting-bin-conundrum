nohup gunicorn --workers 2 --bind 0.0.0.0:8000 wsgi:app &
nohup python3 scheduled_writer.py &
pgrep gunicorn
pgrep python3
