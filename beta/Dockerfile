FROM node:12-alpine as builder

RUN apk --no-cache add git # just in case some modules needs to be installed using git

WORKDIR /var/www/app

COPY . .

ENV NODE_ENV=development

RUN npm install lerna -g

RUN lerna bootstrap

FROM node:12-alpine

WORKDIR /var/www/app

COPY --from=builder /var/www/app/node_modules ./node_modules
COPY --from=builder /var/www/app/package* ./
COPY ./beta ./beta
COPY ./embed ./embed
COPY ./lerna.json ./

ENV NODE_ENV=production

RUN npm run build # bankai build to beta/dist
RUN npm run build:embed # bankai build to embed/dist

EXPOSE 3000

CMD ["npm", "start"]
