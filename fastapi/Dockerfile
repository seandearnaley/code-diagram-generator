# Use the official Python image as the base image
FROM python:3.10-slim as builder

# Set the working directory
WORKDIR /app

# Declare environment variables
ENV PYTHONPATH=/app
ENV SOURCE_FOLDER=/source-repos
ENV OPENAI_ORG_ID=${OPENAI_ORG_ID}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

# Install system dependencies
RUN apt-get update && \
    apt-get install -y curl gnupg wget libxss1 fonts-liberation chromium && \
    rm -rf /var/lib/apt/lists/*

# Create a wrapper for Chromium that includes the --no-sandbox option
RUN echo '#!/bin/bash\nexec chromium --no-sandbox "$@"' > /usr/bin/chromium-nosandbox && \
    chmod +x /usr/bin/chromium-nosandbox

# Set the environment variable for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-nosandbox

# Create the pptruser user and set necessary permissions
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser && \
    mkdir -p /home/pptruser/Downloads && \
    chown -R pptruser:pptruser /home/pptruser


# Install node and npm as root
# https://github.com/nodesource/distributions#installation-instructions
RUN set -uex; \
    apt-get update; \
    apt-get install -y ca-certificates curl gnupg; \
    mkdir -p /etc/apt/keyrings; \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
     | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
    NODE_MAJOR=18; \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
     > /etc/apt/sources.list.d/nodesource.list; \
    apt-get update; \
    apt-get install nodejs npm -y;

# Switch to non-root user for npm global package installation
USER pptruser

# Set the environment variable for the non-root user
ENV NPM_PACKAGES=/home/pptruser/.npm-packages

# Configure npm to use the new directory path
RUN echo "prefix=$NPM_PACKAGES" >> /home/pptruser/.npmrc

# Add the new path to the system PATH
ENV PATH=$NPM_PACKAGES/bin:$PATH

# Install mermaid-cli as non-root user
RUN npm install -g @mermaid-js/mermaid-cli

# Switch back to root user
USER root

# Install poetry and Python dependencies
COPY pyproject.toml poetry.lock /app/
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install

# Copy the rest of the application code
COPY ./ /app

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
