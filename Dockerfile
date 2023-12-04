FROM node:20-alpine AS base
RUN apk update
RUN apk add --no-cache g++ gcc libgcc libstdc++ linux-headers make py3-pip
WORKDIR /digital_edition_web_ng

FROM base as build
COPY . .
RUN npm install -g @angular/cli@17
RUN npm install
RUN npm run generate-sitemap
RUN npm run build:ssr

FROM base
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY --from=build /digital_edition_web_ng/dist /digital_edition_web_ng/dist
CMD ["node","dist/app/proxy-server.js"]
