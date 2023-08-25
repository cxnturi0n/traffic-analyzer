FROM node:alpine AS builder

ENV NODE_ENV production

ARG REACT_APP_EXPRESS_BASE_URL 
ARG REACT_APP_EXPRESS_API_PREFIX
ARG REACT_APP_UI_BASE_PREFIX

ENV REACT_APP_EXPRESS_BASE_URL=${REACT_APP_EXPRESS_BASE_URL}
ENV REACT_APP_EXPRESS_API_PREFIX=${REACT_APP_EXPRESS_API_PREFIX}
ENV REACT_APP_UI_BASE_PREFIX=${REACT_APP_UI_BASE_PREFIX}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

EXPOSE 80

COPY --from=builder /app/build /usr/share/nginx/traffic-analyzer-web-app

COPY nginx.conf /etc/nginx/conf.d/default.conf



