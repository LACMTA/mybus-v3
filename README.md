# MyBus v2.0

The MyBus site was re-implemented using [`LACMTA/11ty-web-template`](https://github.com/LACMTA/11ty-web-template).

## Content Updates

Start from the latest `dev` branch of the `mybus-v3` repository.

Fork a branch `month-yy-shakeup`.

Duplicate the two spreadsheets that are used to populate content.

Update share settings so anyone on the web can view.

Publish the first sheet to the web as a CSV file.

Update the URL used in `package.json` with the sheet's ID (referenced from the URL for editing the sheet, not the one used for publishing to the web):

```
https://docs.google.com/spreadsheets/d/{ sheet_id }/export?format=csv&usp=sharing&gid=0
```

Create a new folder in `_data` for the new data files and update the file output paths in `package.json`:

```
src/_data/{ yyyy-mm}/updates.csv
```

Update some of the rows in the content sheet.

Download the remote csv files using curl commands and run the data parsing scripts on them to turn them into json data:

```
npm run fetch:data
npm run parse:data
```

New `XX-content.json` files for each target language will be created in the `data/` folder.

Build and serve locally:

```
npm run local:serve
```

Commit changes and push to the `dev` remote repository located at ` https://github.com/LACMTA/mybus-v3-dev`.

Update the repository's default branch to point to this new branch.

Update the repository's Pages settings to point to this new branch.

Manually run the __Build 11ty site for Dev__ workflow.

## Quickstart

### Install

Use `node --version` to verify you're running Node 12 or newer.

### Local Development

Run this command to build & serve the site locally. It will automatically rebuild and reload the site if any files are modified.

``` bash
npm run dev:serve
```

❗❗❗ If this is your first time running `@11ty/eleventy`, the package will be installed. Type `y` when prompted to proceed.

Open `http://localhost:8080/` in your browser to view the site.

### Config

`package.json` includes a few pre-defined scripts and a local environment variable to help with running/building the site.  The logic to check the environment variable and determine whether to build with the `pathPrefix` is in `.eleventy.js`.

| Command | `NODE_ENV` | Usage |
| ------- | ---------- | ----- |
| `npm run dev:serve` | `dev` | Use this locally while developing to build and serve the site for testing. By default, this will use the `pathPrefix` value (defined in `.eleventy.js`) but the `pathPrefix` only matters here if you are serving the site from a parent directory instead of the repo's directory. |
| `npm run dev:build` | `dev` | Use this to build the site for deploying to a GitHub repo hosted via GitHub Pages **without** a custom domain. This is because the site's URL will be under a subdirectory: `<org-name>.github.io/<repo-name>/` and you will need the paths to be built accordingly. |
| `npm run prod:build` | `prod` | Use this to build the site for deploying to a GitHub repo hosted via GitHub Pages **with** a custom domain. This will cause link paths to be built without a `pathPrefix`. |

`.github/workflows/node.js.yml` needs to use the npm command you want to be run via GitHub Actions:

``` yaml
    - name: Build Site
      run: npm run prod:build
```

### USWDS

10/10 - Integrated USWDS by running `npm install uswds` and `npm install @uswds/compile`.  `gulpfile.js` configures the compiler and running `npx gulp init` initializes the folders defined in the configuration: `_theme/` and `assets/`.

This line was added to `.elenventy.js`: `eleventyConfig.addPassthroughCopy("assets/uswds");`.

CSS and JS files are linked to in `head.liquid`:

``` html
<link rel="stylesheet" href="{{ '/assets/uswds/css/styles.css' | url }}">
<script src="{{ '/assets/uswds/js/uswds-init.min.js' | url }}"></script>
```

JS file also linked to at the bottom of `footer.liquid`:

``` html
<script src="{{ '/assets/uswds/js/uswds.min.js' | url }}"></script>
```

Run `npx gulp compile` to recompile the files.  Run `npx gulp watch` to watch the script for chnages and automatically recompile.

### Development Notes

Make sure links to site pages, assets, etc. are built relatively using this syntax:

```
{{ 'path' | url }}
```

Where `path` is the path to the resource under the `src` folder. It needs a leading `/`. Example:

```
/img/articulated-buses-mobile.png
```

## Development Environment

Start in the `mybus-v3` repository and create a new branch for the shakeup, ex. `december-2024-shakeup`.  Make a change and push it to the `mybus-v3-dev` repository using the command `git push dev` and then update the GitHub Pages setting to point to deploy from this branch.



## Updates

### Schedule PDF File Name Normalization

`rename.js` contains a script the checks all the schedule PDF file names and renames them to a standard format: `###_TT_MM-DD-YY.pdf` or `###-###_TT_MM-DD-YY.pdf`.

After receiving new PDFs from the Scheduling team, run this script using the following command:

``` bash
npm run rename
```

Props to [@scriptex for this Gist](https://gist.github.com/scriptex/20536d8cda36221f91d69a6bd4a528b3).

❗❗❗ TODO: [populate the `_data/allChanges.json` file with these file names.](https://github.com/LACMTA/mybus-v2/issues/3)


## Using 11ty

### Publishing to GitHub Pages

The `.eleventy.js` config file needs the following two settings for GitHub Pages publishing:

1. Change the output directory from the default `_site/` to the directory used by GitHub Pages: `docs/`.
2. Add a path prefix with the repository name because 11ty builds links using the root as the default, but GitHub Pages without a custom domain follow the format `account.github.io/repository-name/`.

Example:

``` js
module.exports = function(eleventyConfig) {
    return {
        pathPrefix: "/11ty-website-example/",
        dir: {
            output: "docs"
        }
    }
}
```

### Ignored Files

The `.eleventyignore` works like other ignore files.  The `README.md` file is added here so that 11ty does not try to build the README into a page.

### NPM Setup

This repository's `package.json` file was initialized using `npm init -y`.

11ty does not automatically clean the output folder before building so any deleted source files will need to be deleted from the output folder.  One easy way to take care of this is to just delete the entire output folder before building. This can be done using a shortcut script built into the `package.json` file.

Here are some shortcut scripts that have already been added in this repo:

``` js
"build": "npx @11ty/eleventy",
"serve": "npx @11ty/eleventy --serve"
```

Scripts can be chained together like this:

``` js
"clean": "npx rimraf docs",
"build": "npx @11ty/eleventy",
"clean:build": "npm run clean && npm run build",
"start": "npm run clean && npm run build && npm run serve"
```

#### Fix for cross-platform `rm rf`

We used the fix documented here:
   - https://docgov.dev/posts/npm-scripts/

Use the following command to get started:

``` bash
npm run start
```

### Liquid Templates

#### Using Includes

To use includes without quotes, they need to be enabled via `dynamicPartials: false` in the Liquid options. Front matter in the include file will not be evaluated. By default, includes must be formatted this way: `{% include 'user' %}`, which looks for `_includes/user.liquid`.

## Route Overview file

A match is made between the route as listed in the Google Sheet and the route as listed in the `route_overview.csv` file based off whether the line matches one of these three in order:

* route_code
* route_short_name
* route_id

If they exist, `terminal_1` and `terminal_2` values are used to build the route description.  Otherwise, the route description is set to the `long_name` value.

