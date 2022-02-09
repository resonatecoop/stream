FROM node:12-alpine

RUN apk --no-cache add git # just in case some modules needs to be installed using git

WORKDIR /var/www/app

COPY . .

ENV NODE_ENV=development

RUN npm install

RUN npm run build # bankai build to beta/dist

EXPOSE 3000

CMD ["npm", "start"]
