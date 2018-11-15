"use strict";

const path = require("path");
const fs = require("mz/fs");
const linter = require("addons-linter");
const inquirer = require("inquirer");
const withTmpDir = require("./helpers/tmp-dir");
const cmdRunner = require("./helpers/cmd-runner");

const execDirPath = path.join(__dirname, "..", "bin");

jest.mock("inquirer");
const promptAnswers = {
  description: "some description",
  popup: true,
  contentScript: false,
};
inquirer.prompt.mockResolvedValue(promptAnswers);

describe("main", () => {
  test("creates files including manifest with correct name", () => withTmpDir(
    (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);

      cmdRunner([`${execDirPath}/create-webextension`, `${targetDir}`]).then(() => {
        const contentStat = fs.stat(path.join(targetDir, "content.js"));
        expect(contentStat.isDirectory()).toBeFalsy();

        const bgStat = fs.stat(path.join(targetDir, "background.js"));
        expect(bgStat.isDirectory()).toBeFalsy();

        const manifest = fs.readFile(path.join(targetDir, "manifest.json"), "utf-8");
        const parsed = JSON.parse(manifest);
        expect(parsed.name).toEqual(projName);
        expect(parsed.description).toEqual(promptAnswers.description);
      });
    })
  );

  test("created project is linted correctly", () => withTmpDir(
    (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);

      cmdRunner([`${execDirPath}/create-webextension`, `${targetDir}`]).then(() => {
        const config = {
          _: [targetDir],
          logLevel: "fatal",
          stack: true,
          pretty: true,
          warningsAsErrors: false,
          metadata: false,
          output: "none",
          boring: false,
          selfHosted: false,
        };
        const linterInstance = linter.createInstance({
          config,
          runAsBinary: false,
        });
        const summary = {
          errors: 0,
          notices: 0,
          warnings: 0,
        };

        const instance = linterInstance.run();
        expect(instance.summary).toEqual(summary);
      });
    })
  );
});
