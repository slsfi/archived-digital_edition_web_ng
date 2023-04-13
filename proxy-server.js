const express = require("express");
const path = require("path");

const getTranslatedServer = (lang) => {
    const distFolder = path.join(
        process.cwd(),
        `dist/app/server/${lang}`
    );
    const server = require(`${distFolder}/main.js`);
    return server.app(lang);
};

function run() {
    const port = process.env['PORT'] || 4201;

    // Start up the Node server
    const appFi = getTranslatedServer("fi");
    const appSv = getTranslatedServer("sv");

    const server = express();
    server.use("/fi", appFi);
    server.use("/sv", appSv);
    server.use("", appSv);

    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

run();
