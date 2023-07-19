# Use the official Python image as the base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl gnupg wget libxss1 fonts-liberation chromium

# Create a wrapper for Chromium that includes the --no-sandbox option
RUN echo '#!/bin/bash\nexec chromium --no-sandbox "$@"' > /usr/bin/chromium-nosandbox \
    && chmod +x /usr/bin/chromium-nosandbox

# Set the environment variable for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-nosandbox

# Create the pptruser user and set necessary permissions
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

# Install node and npm as root
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs npm

# Switch to non-root user for npm global package installation
USER pptruser

# Set the environment variable for the non-root user
ENV NPM_PACKAGES=/home/pptruser/.npm-packages

# Configure npm to use the new directory path
RUN echo "prefix=$NPM_PACKAGES" >> /home/pptruser/.npmrc

# Add the new path to the system PATH
ENV PATH=$NPM_PACKAGES/bin:$PATH

# Ensure that any binaries installed via npm can be found by your shell
RUN echo 'export PATH=$NPM_PACKAGES/bin:$PATH' >> /home/pptruser/.bashrc

# Install mermaid-cli as non-root user
RUN npm install -g @mermaid-js/mermaid-cli

# Switch back to root user
USER root

# Copy the pyproject.toml file and install Python dependencies
COPY pyproject.toml poetry.lock /app/
RUN pip install poetry && poetry config virtualenvs.create false && poetry install

# Copy the rest of the application code
COPY ./app /app

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
