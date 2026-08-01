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
# Stage 2: Final runtime container
# =========================================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Set production environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    PATH=/home/appuser/.local/bin:$PATH

# Create a secure, non-privileged system user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m -s /bin/bash appuser

# Copy installed pip packages from builder
COPY --from=builder --chown=appuser:appgroup /root/.local /home/appuser/.local

# Copy application source code
COPY --chown=appuser:appgroup . .

# Set container user context to the secure non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check probe configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/', timeout=5)"

# Launch backend FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
