FROM node:12-alpine

RUN apk --no-cache add git # just in case some modules needs to be installed using git

WORKDIR /var/www/app

COPY . .

ENV NODE_ENV=development

RUN npm install lerna -g

RUN lerna bootstrap

RUN npm run build # bankai build to beta/dist
