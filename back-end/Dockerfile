FROM python:3.11-slim AS base

WORKDIR /app

RUN groupadd --system app && useradd --system --gid app appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:app /app

USER appuser

FROM base AS dev
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM base AS prod
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]