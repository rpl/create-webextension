"use strict";

const path = require("path");
const chalk = require("chalk");
const fs = require("mz/fs");
const stripAnsi = require("strip-ansi");

const USAGE_MSG = `Usage: create-webextension project_dir_name`;

const README = `
This project contains a blank WebExtension addon, a "white canvas" for your new experiment of
extending and remixing the Web.
`;

const MORE_INFO_MSG = `

and now?

  ${chalk.bold.underline.white("https://addons.mozilla.org/en-US/developers/")}

You can find an overview, API docs, guides and how-tos on MDN:

  ${chalk.bold.underline.white("https://developer.mozilla.org/en-US/Add-ons/WebExtensions")}

or look at the webextensions-examples git repo on Github as a source of API usage examples:

  ${chalk.bold.underline.white("https://github.com/mdn/webextensions-examples")}

You should also install the web-ext CLI tool, it is very helpful to run, lint and sign
a WebExtension from the command line:

  ${chalk.bold.underline.white("https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext")}

  ${chalk.bold.blue("npm (or yarn) install -g web-ext")}

  ${chalk.bold.blue("web-ext run -s /path/to/extension")}
`;

function getProjectCreatedMessage(projectPath) {
  return fs.readFile(path.join(__dirname, "assets", "webextension-logo.ascii"))
           .then(asciiLogo => {
             const PROJECT_CREATED_MSG = `\n
Congratulations!!! A new WebExtension has been created at:

  ${chalk.bold(chalk.green(projectPath))}`;

             return `${asciiLogo} ${PROJECT_CREATED_MSG} ${MORE_INFO_MSG}`;
           });
}

function getProjectReadme(projectDirName) {
  return fs.readFile(path.join(__dirname, "assets", "webextension-logo.ascii"))
    .then(() => {
      return `# ${projectDirName}\n${README}${MORE_INFO_MSG}`;
    });
}

function getPlaceholderIcon() {
  return fs.readFile(path.join(__dirname, "assets", "icon.png"));
}

function getProjectManifest(projectDirName) {
  return {
    manifest_version: 2,
    name: projectDirName,
    version: "0.1",
    description: `${projectDirName} description`,
    content_scripts: [
      {
        matches: ["https://developer.mozilla.org/*"],
        js: ["content.js"],
      },
    ],
    permissions: [],
    icons: {
      "64": "icon.png",
    },
    browser_action: {
      default_title: `${projectDirName} (browserAction)`,
      default_icon: {
        "64": "icon.png",
      },
    },
    background: {
      scripts: ["background.js"],
    },
  };
}

exports.main = function main() {
  if (!process.argv[2]) {
    console.error(`${chalk.red("Missing project dir name.")}\n`);
    console.log(USAGE_MSG);
    process.exit(1);
  }

  const projectPath = path.resolve(process.argv[2]);
  const projectDirName = path.basename(projectPath);

  return fs.mkdir(projectPath).then(() => {
    return Promise.all([
      fs.writeFile(path.join(projectPath, "manifest.json"),
                   JSON.stringify(getProjectManifest(projectDirName), null, 2)),
      fs.writeFile(path.join(projectPath, "background.js"),
                   `console.log("${projectDirName} - background page loaded");`),
      fs.writeFile(path.join(projectPath, "content.js"),
                   `console.log("${projectDirName} - content script loaded");`),
    ]).then(() => getPlaceholderIcon())
      .then(iconData => fs.writeFile(path.join(projectPath, "icon.png"), iconData))
      .then(() => getProjectReadme(projectDirName))
      .then(projectReadme => fs.writeFile(path.join(projectPath, "README.md"),
                                          stripAnsi(projectReadme)))
      .then(() => getProjectCreatedMessage(projectPath))
      .then(console.log);
  }, error => {
    if (error.code === "EEXIST") {
      const msg = `Unable to create a new WebExtension: ${chalk.bold.underline(projectPath)} dir already exist.`;
      console.error(`${chalk.red(msg)}\n`);
      process.exit(1);
    }
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
};
