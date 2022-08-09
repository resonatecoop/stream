FROM node:18-alpine

RUN apk --no-cache add git # just in case some modules needs to be installed using git

WORKDIR /var/www/app

COPY . .

ENV NODE_ENV=development

RUN npm install
RUN npm install npm@latest -g

RUN npm run build # bankai build to beta/dist

EXPOSE 8080

CMD ["npm", "start"]
