FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install --no-cache-dir uv \
    && uv sync --locked --no-dev

COPY src ./src
COPY alembic.ini ./
COPY alembic ./alembic

ENV PYTHONPATH=/app/src
ENV PATH="/app/.venv/bin:$PATH"

RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]