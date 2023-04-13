FROM node:18-alpine

RUN apk update
RUN apk add --no-cache g++ gcc libgcc libstdc++ linux-headers make py3-pip git

RUN git clone --depth 1 -b angular-15 https://github.com/slsfi/digital_edition_web_ng.git

WORKDIR /digital_edition_web_ng

RUN npm install -g @angular/cli
RUN npm install
RUN npm run build:ssr

# delete default locale directory. In this project, default locale is "aa"
RUN rm -r /digital_edition_web_ng/dist/app/browser/aa

CMD ["npm","run","serve:ssr"]
