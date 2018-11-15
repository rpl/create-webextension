"use strict";

const path = require("path");
const chalk = require("chalk");
const fs = require("mz/fs");
const stripAnsi = require("strip-ansi");
const inquirer = require('inquirer');
const permissionOptions = require('./permissionOptions');

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

function extendJSON(filepath, content) {
  return fs.readFile(filepath, 'utf-8', (err, data) => {
    const originalContent = JSON.parse(data);
    const newContent = Object.assign({}, originalContent, content);
    const jsonStr = JSON.stringify(newContent, null, 2 ) + '\n';
    fs.writeFile(filepath, jsonStr);
  });
}

function getProjectManifest(projectDirName, options) {
  return {
    manifest_version: 2,
    name: projectDirName,
    version: "0.1",
    description: options.description,
    permissions: options.permissions,
    icons: {
      "64": "icon.png",
    },
  };
}

const QUESTIONS = [{
    name: 'description',
    message: 'Give a description for your web extension'
  },
  {
    name: 'popup',
    message: 'Would you like to use a popup?',
    type: 'confirm',
    default: true
  },
  {
    name: 'contentScript',
    message: 'Would you like to use a content script?',
    type: 'confirm',
    default: false
  },
  {
    type: 'input',
    name: 'contentScriptMatch',
    message: 'Define a match pattern for your content script?',
    when: response => {
      return response.contentScript;
    }
  },
  {
    name: 'background',
    message: 'Would you like to use a background script?',
    type: 'confirm',
    default: false
  },
  {
    type: 'checkbox',
    name: 'permissions',
    message: 'Would you like to set permissions?',
    choices: permissionOptions.permissionChoices
}];

exports.main = function main() {
  if (!process.argv[2]) {
    console.error(`${chalk.red("Missing project dir name.")}\n`);
    console.log(USAGE_MSG);
    process.exit(1);
  }

  const projectPath = path.resolve(process.argv[2]);
  const projectDirName = path.basename(projectPath);


  return fs.mkdir(projectPath).then(() => {
    inquirer.prompt(QUESTIONS).then(answers => {
      fs.writeFile(path.join(projectPath, "manifest.json"),
                   JSON.stringify(getProjectManifest(projectDirName, answers), null, 2))
      if (answers.background) {
        extendJSON(path.join(projectPath, "manifest.json"),{
          background: {
            scripts: ["background.js"],
          },
        });
        fs.writeFile(path.join(projectPath, "background.js"),
                     `console.log("${projectDirName} - background page loaded");`)
      }
      if (answers.contentScript) {
        const matches = answers.contentScriptMatch || "<all_urls>";
        extendJSON(path.join(projectPath, "manifest.json"),{
          content_scripts: [
            {
              matches: [matches],
              js: ["content.js"],
            },
          ],
        });
        fs.writeFile(path.join(projectPath, "content.js"),
                     `console.log("${projectDirName} - content script loaded");`);
      }
      if (answers.popup) {
        extendJSON(path.join(projectPath, "manifest.json"),{
          browser_action: {
            default_title: `${projectDirName} (browserAction)`,
            default_icon: {
              "64": "icon.png",
            },
          },
        });
      }
    }).then(() => getPlaceholderIcon())
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
