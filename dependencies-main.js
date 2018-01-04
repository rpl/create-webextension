const path = require("path");
const fs = require("mz/fs");

const README = `
This project contains a blank WebExtension addon, a "white canvas" for your new experiment of
extending and remixing the Web.
`;

exports.getProjectReadme = function getProjectReadme(
  projectDirName,
  MORE_INFO_MSG
) {
  return fs.readFile(path.join(__dirname, "assets", "webextension-logo.ascii"))
    .then(() => {
      return `# ${projectDirName}\n${README}${MORE_INFO_MSG}`;
    });
};

exports.getPlaceholderIcon = function getPlaceholderIcon() {
  return fs.readFile(path.join(__dirname, "assets", "icon.png"));
};

exports.getProjectManifest = function getProjectManifest(projectDirName) {
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
};
