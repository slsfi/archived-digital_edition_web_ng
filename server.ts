/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
import 'zone.js/dist/zone-node';
import { LOCALE_ID } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { environment } from './src/environments/environment';

// The Express app is exported so that it can be used by serverless Functions.
export function app(lang: string): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), `dist/app/browser/${lang}`);
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)

  // SK 31.5.2023: Added inlineCriticalCss: false. See:
  // https://github.com/angular/universal/issues/2106
  // https://github.com/angular/angular/issues/42098
  // Also added optimization property that disables inlineCritical
  // in angular.json: architect.build.configurations.production
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
    extraProviders: [{ provide: LOCALE_ID, useValue: lang }],
    inlineCriticalCss: false,
  } as any));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, {
      req, providers: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        { provide: LOCALE_ID, useValue: lang }
      ]
    });
  });

  return server;
}

// * In production mode, the server is started by proxy-server.js
// * and this function is never run.
function runDev(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const appSv = app('sv');
  const server = express();
  server.use('/sv', appSv);
  server.use('', appSv);
  server.listen(port, () => {
    console.log(`Node Express dev server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
// * This is run ONLY in development mode!
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (!environment.production && moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  runDev();
}

export * from './src/main.server';
