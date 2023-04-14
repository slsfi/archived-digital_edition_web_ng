FROM node:18-alpine

RUN apk update
RUN apk add --no-cache g++ gcc libgcc libstdc++ linux-headers make py3-pip

RUN mkdir /digital_edition_web_ng

WORKDIR /digital_edition_web_ng

ADD . /digital_edition_web_ng

RUN npm install -g @angular/cli@^15.2.2
RUN npm install
RUN npm run build:ssr

# delete default locale directory. In this project, default locale is "aa"
RUN rm -r /digital_edition_web_ng/dist/app/browser/aa

CMD ["npm","run","serve:ssr"]
