"use strict";

const path = require("path");
const chalk = require("chalk");
const fs = require("mz/fs");
const stripAnsi = require("strip-ansi");
const UsageError = require("./errors").UsageError;
const dependenciesMain = require("./dependencies-main");

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

const PROJECT_CREATED_MSG = "\nCongratulations!!! A new WebExtension has been created at:\n\n";

exports.getProjectCreatedMessage = function getProjectCreatedMessage(projectPath, dirname = __dirname) {
  return fs.readFile(path.join(dirname, "assets", "webextension-logo.ascii")).then(asciiLogo => {
    const formattedProjectPath = `${chalk.bold(chalk.green(projectPath))}`;

    return `\n${asciiLogo} ${PROJECT_CREATED_MSG}  ${formattedProjectPath} ${MORE_INFO_MSG}`;
  });
};

exports.main = function main({
  dirPath,
  baseDir = process.cwd(),
  dependencies = dependenciesMain,
}) {
  if (!dirPath) {
    throw new Error("Project directory name is a mandatory argument");
  }

  const projectPath = path.resolve(baseDir, dirPath);
  const projectDirName = path.basename(projectPath);

  return fs.mkdir(projectPath).then(() => {
    return Promise.all([
      fs.writeFile(path.join(projectPath, "manifest.json"),
                   JSON.stringify(dependencies.getProjectManifest(projectDirName), null, 2)),
      fs.writeFile(path.join(projectPath, "background.js"),
                   `console.log("${projectDirName} - background page loaded");`),
      fs.writeFile(path.join(projectPath, "content.js"),
                   `console.log("${projectDirName} - content script loaded");`),
    ]).then(() => dependencies.getPlaceholderIcon())
      .then(iconData => fs.writeFile(path.join(projectPath, "icon.png"), iconData))
      .then(() => dependencies.getProjectReadme(projectDirName, MORE_INFO_MSG))
      .then(projectReadme => fs.writeFile(path.join(projectPath, "README.md"),
                                          stripAnsi(projectReadme)))
      .then(() => module.exports.getProjectCreatedMessage(projectPath))
      .then(projectCreatedMessage => {
        return {projectPath, projectCreatedMessage};
      });
  }, error => {
    if (error.code === "EEXIST") {
      const msg = `Unable to create a new WebExtension: ${chalk.bold.underline(projectPath)} dir already exists.`;
      throw new UsageError(msg);
    }

    // Re-throw any unexpected errors.
    throw error;
  });
};
