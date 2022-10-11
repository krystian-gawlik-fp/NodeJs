FROM alpine:3.15
WORKDIR /app
COPY . /app
RUN apk add --update nodejs npm
RUN npm install
RUN npm run tsoa
CMD ["npm", "start"]