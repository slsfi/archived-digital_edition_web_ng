# Archived dev version of the Angular frontend app for the SLS Digital Edition Platform

⚠️⚠️⚠️

This is the **archived dev version** of the frontend application for the [SLS][SLS] platform for building digital edition web apps. It holds the **development history** of the Angular frontend app and **must not be used!**

The maintained production-ready version of the app, which was migrated without git history from this repository on 5 December 2023, is found here: [`digital-edition-frontend-ng`](https://github.com/slsfi/digital-edition-frontend-ng)

**THIS REPOSITORY CAN BE DELETED WHEN THE DEV HISTORY OF THE ANGULAR FRONTEND APP IS NO LONGER NEEDED!**

⚠️⚠️⚠️

The app supports features typically found in digital scholarly editions, like reading texts, manuscripts, facsimiles and commentaries in parallell views, as well as media collection libraries, indices of named entities and keywords, and an integrated EPUB-viewer.

Internationalization and server-side rendering are supported out of the box, meaning that your web app will be fully indexable by search engines and readable by AI bots. The frontend app utilizes a responsive design and works on both desktop and mobile devices. Many features of the user interface are easily configurable, and theming is straightforward.

Examples of digital editions employing this frontend app include:

- [Zacharias Topelius Skrifter][topelius]
- [Leo Mechelin – Pro lege][mechelin]

The app is built on [Angular][angular] and uses [Ionic][ionic] web components.

<p>
  <a href="https://github.com/angular/angular"><img alt="Angular version badge" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fslsfi%2Fdigital_edition_web_ng%2Fmain%2Fpackage-lock.json&query=%24%5B'dependencies'%5D%5B'%40angular%2Fcore'%5D%5B'version'%5D&prefix=v&logo=angular&logoColor=%23fff&label=Angular&color=%23dd0031"></a>
  &nbsp;
  <a href="https://github.com/ionic-team/ionic-framework"><img alt="Ionic version badge" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fslsfi%2Fdigital_edition_web_ng%2Fmain%2Fpackage-lock.json&query=%24%5B'dependencies'%5D%5B'%40ionic%2Fcore'%5D%5B'version'%5D&prefix=v&logo=ionic&logoColor=%23fff&label=Ionic&color=%23176bff"></a>
</p>

<hr>

## Changelog

[Learn about the latest improvements][changelog].


## Setting Up a Project

1. Create a fork of this repository. Only include the `main` branch.

2. Rename the default branch of the forked repository `base`, `shared` or something similar.

3. Create a new branch in the forked repository and name it `production`, `prod` or something similar.

4. Configure your project app by editing `/src/assets/config/config.ts`. Documentation on the configuration options is forthcoming.

The `base` branch of the forked repository must **never** be manually modified. It must be kept as a clone of the upstream `main` branch in this repository. When the upstream `main` branch is updated, you can sync the updates to the `base` branch in your forked repository. You can then merge the `base` branch into your `production` branch.

This workflow enables updates to the app in this repository to be easily distributed to forked project repositories.

By default, the app has Swedish and Finnish language versions enabled. See the documentation (forthcoming) on how to configure internationalization, customize your app, build it for production and deploy it.


## Development Setup

### Prerequisites

1. Install [Node.js][node.js] which includes [npm][npm]. The app is compatible with Node `^18.13.0` and `^20.9.0`. Check your Node version with:

```
Node --version
```

2. Install the [Angular CLI][angular_cli] globally:

```
npm install -g @angular/cli
```

3. [Clone][clone_repository] this repository locally and `cd` into the folder. On Windows you can use [GitHub Desktop][github_desktop] or [Git Bash][git_bash] (see [tutorial on Git Bash][gith_bash_tutorial]).

4. Install dependencies:

```
npm install
```

### Running locally

#### Development Server

To build and serve the application on a development server as just a client-side app, run:

```
npm run start
```

Open your browser on http://localhost:4200/. The app will automatically rebuild and reload if you change any of the source files.

#### Server-Side Rendered App

To build the server-side rendered application, run:

```
npm run build:ssr
```

Then, to serve the app, run:

```
npm run serve:ssr
```

Open your browser on http://localhost:4201/. You need to manually run the build and serve commands again for changes in the source files to take effect.


## Earlier version

The frontend app in this repository is an updated version of [`digital_edition_web`][digital_edition_web], which is an Ionic 3/Angular 5 frontend app.


## About the SLS Digital Edition Platform

The platform consists of a [Flask-driven REST API][digital_edition_api], a [backend search app][digital_edition_search] run by the Elastic (ELK) Stack, a [template for a backend files repository][digital_edition_required_files_template] and a [database template][digital_edition_db]. There is also a [tool for creating commentaries][digital_edition_commentary] to texts in [TEI-XML][TEI] format.


[angular]: https://angular.io/
[angular_cli]: https://angular.io/cli
[changelog]: CHANGELOG.md
[clone_repository]: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[digital_edition_api]: https://github.com/slsfi/digital_edition_api
[digital_edition_commentary]: https://github.com/slsfi/digital_edition_commentary
[digital_edition_db]: https://github.com/slsfi/digital_edition_db
[digital_edition_required_files_template]: https://github.com/slsfi/digital_edition_required_files_template
[digital_edition_search]: https://github.com/slsfi/digital_edition_search
[digital_edition_web]: https://github.com/slsfi/digital_edition_web
[git_bash]: https://gitforwindows.org/
[gith_bash_tutorial]: https://www.atlassian.com/git/tutorials/git-bash
[github_desktop]: https://desktop.github.com/
[ionic]: https://ionicframework.com/
[mechelin]: https://leomechelin.fi/
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/get-npm
[SLS]: https://www.sls.fi/en
[TEI]: https://tei-c.org/
[topelius]: https://topelius.sls.fi/
