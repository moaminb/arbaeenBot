FROM python:3.9-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    libssl-dev \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code and pre-built frontend
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Set environment variables for production
ENV PYTHONUNBUFFERED=1

# Command to run the application
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
