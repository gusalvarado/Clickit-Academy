FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Node.js (for ESLint)
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install ESLint and security plugin globally
RUN npm install -g eslint eslint-plugin-security

# Copy application code
COPY . .

# Create data directory for checkpoints
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

