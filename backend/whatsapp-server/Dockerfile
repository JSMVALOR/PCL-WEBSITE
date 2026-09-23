FROM ghcr.io/puppeteer/puppeteer:latest

# Environment Variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Switch to root to install dependencies and fix permissions
USER root
COPY package*.json ./
RUN npm ci
COPY . .
RUN chown -R pptruser:pptruser /usr/src/app

# Switch back to the unprivileged user
USER pptruser

EXPOSE 3001
CMD [ "node", "server.js" ]
