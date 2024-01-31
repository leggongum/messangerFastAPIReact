FROM python:3.11.5-slim-bookworm

WORKDIR /app

COPY ./requirements.txt .

RUN python -m pip install -r requirements.txt

COPY . .

CMD cd src && uvicorn main:app --host 0.0.0.0 --port 8000