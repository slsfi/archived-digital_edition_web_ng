FROM node:18-alpine

RUN apk update
RUN apk add --no-cache g++ gcc libgcc libstdc++ linux-headers make py3-pip

RUN node --version
RUN npm --version

RUN mkdir /digital_edition_web_ng

WORKDIR /digital_edition_web_ng

ADD . /digital_edition_web_ng

RUN npm install -g @angular/cli@17
RUN npm install

RUN npm run generate-sitemap
RUN npm run build:ssr

CMD ["npm","run","serve:ssr"]
