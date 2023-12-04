# This Dockerfile leverages multi-stage builds so
# only necessary build artifacts and resources are
# included in the final image.

FROM node:20-alpine AS base
# Update index of available packages for Alpine Linux.
RUN apk update
# Install additional packages.
RUN apk add --no-cache g++ gcc libgcc libstdc++ linux-headers make py3-pip
# Update npm to latest stable version.
RUN npm install -g npm@latest
# Change working directory.
WORKDIR /digital_edition_web_ng

FROM base AS build
# Copy all files from the source folder to the
# workdir in the container filesystem.
COPY . .
# Install the Angular CLI globally.
RUN npm install -g @angular/cli@17
# Install app dependencies.
RUN npm install
# Run script that generates sitemap.txt.
RUN npm run generate-sitemap
# Build the Angular SSR app.
RUN npm run build:ssr

FROM base AS final
# Copy package.json and package-lock.json from the
# source folder to the workdir in the container filesystem.
COPY package.json package-lock.json ./
# Install production dependencies of the app only. This is
# necessary because proxy-server.js, which is outside the
# Angular build but runs the server, requires the 'express'
# module.
RUN npm install --omit=dev
# Copy the dist folder from the build image to the final
# runtime image.
COPY --from=build /digital_edition_web_ng/dist /digital_edition_web_ng/dist
# Set NODE_ENV environment variable to production.
ENV NODE_ENV production
# Run app.
CMD ["node","dist/app/proxy-server.js"]
