FROM node:22-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    chromium \
    git \
    openssh-client \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json ./
RUN git config --global url."https://github.com/".insteadOf ssh://git@github.com/
RUN npm install

COPY . .

EXPOSE 10000

CMD ["node", "server.js"]
