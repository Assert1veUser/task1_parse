FROM node:20.13.1

WORKDIR /api

COPY package*.json ./
COPY package-lock*.json ./

RUN npm install

COPY . .
COPY backend_cemp ./backend_cemp
COPY routes ./routes
COPY backend_sokol ./backend_sokol
COPY node_modules ./node_modules

EXPOSE 8080

CMD [ "node", "server.js" ]