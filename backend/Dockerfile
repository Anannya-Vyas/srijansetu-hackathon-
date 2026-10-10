FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY . .

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
