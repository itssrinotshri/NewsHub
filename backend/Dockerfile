# =========================================================
# Stage 1: Build & dependency resolver
# =========================================================
FROM python:3.11-slim AS builder

WORKDIR /build

# Install system utilities needed for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first for layer caching
COPY requirements.txt .

# Install dependencies into local directory to optimize copy step
RUN pip install --no-cache-dir --user -r requirements.txt

# =========================================================
# Stage 2: Final runtime container (Hugging Face compliant)
# =========================================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Set production environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/home/appuser/.local/bin:$PATH

# Create a secure, non-privileged system user (UID 1000 is required by Hugging Face)
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup -m -s /bin/bash appuser

# Copy installed pip packages from builder
COPY --from=builder --chown=appuser:appgroup /root/.local /home/appuser/.local

# Copy application source code
COPY --chown=appuser:appgroup . .

# Set container user context to the secure non-root user
USER appuser

# Hugging Face Spaces exposes and expects traffic on port 7860
EXPOSE 7860

# Launch backend FastAPI application using dynamically assigned port, defaulting to 7860
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
