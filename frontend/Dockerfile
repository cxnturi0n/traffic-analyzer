# Fetching the latest node image on alpine linux
FROM node:alpine AS builder

# Declaring env
ENV NODE_ENV production

ARG REACT_APP_EXPRESS_BASE_URL 
ARG REACT_APP_EXPRESS_API_PREFIX

ENV REACT_APP_EXPRESS_BASE_URL=${REACT_APP_EXPRESS_BASE_URL}
ENV REACT_APP_EXPRESS_API_PREFIX=${REACT_APP_EXPRESS_API_PREFIX}

# Setting up the work directory
WORKDIR /app

# Installing dependencies
COPY package*.json ./
RUN npm install

# Copying all the files in our project
COPY . .

# Building our application
RUN npm run build

# Fetching the latest nginx image
FROM nginx:alpine

EXPOSE 80

# Copying built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copying our nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
