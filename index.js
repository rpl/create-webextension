"use strict";

const chalk = require("chalk");
const fs = require("mz/fs");
const path = require("path");

const USAGE_MSG = `Usage: create-webextension project_dir_name`;

const MORE_INFO_MSG = `

  and now?

  You can find an overview, API docs, guides and how-tos on MDN:

    ${chalk.bold.underline.white("https://developer.mozilla.org/en-US/Add-ons/WebExtensions")}

  or look at the webextensions-examples git repo on Github as a source of API usage examples:

    ${chalk.bold.underline.white("https://github.com/mdn/webextensions-examples")}

  You should also install the web-ext CLI tool, it is very helpful to run and sign
  a WebExtension from the command line:

    ${chalk.bold.underline.white("https://github.com/mozilla/web-ext")}

    ${chalk.bold.blue("npm (or yarn) install -g web-ext")}

    ${chalk.bold.blue("web-ext run -s /path/to/extension")}
`;

function printProjectCreatedMessage(projectPath) {
  return fs.readFile(path.join(__dirname, "webextension-logo.ascii")).then(asciiLogo => {
    const PROJECT_CREATED_MSG = `\n
  Congratulations!!! A new WebExtension has been created at:

    ${chalk.bold(chalk.green(projectPath))}`;

    console.log(`${asciiLogo} ${PROJECT_CREATED_MSG} ${MORE_INFO_MSG}`);
  });
}

function main() {
  const projectDirName = process.argv[2];
  let projectPath;

  if (!projectDirName) {
    console.error(`${chalk.red("Missing project dir name.")}\n`);
    console.log(USAGE_MSG);
    process.exit(1);
  }

  projectPath = path.resolve(projectDirName);

  return fs.mkdir(projectPath).then(() => {
    return Promise.all([
    ]).then(() => printProjectCreatedMessage(projectPath));
  }, error => {
    if (error.code === "EEXIST") {
      const msg = `Unable to create a new WebExtension: ${chalk.bold.underline(projectPath)} dir already exist.`;
      console.error(`${chalk.red(msg)}\n`);
      process.exit(1);
    }
  });
}

main();
