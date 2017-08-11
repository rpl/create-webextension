"use strict";

const path = require("path");
const chalk = require("chalk");
const fs = require("mz/fs");
const withTmpDir = require("../helpers/tmp-dir");
const main = require("../../index").main;
const MORE_INFO_MSG = require("../../index").MORE_INFO_MSG;
const asciiLogo = require("../../index").asciiLogo;

describe("main", () => {
  test("returns project path and creation message", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);
      const expectedMessage =
      `${asciiLogo} \n` + `
  Congratulations!!! A new WebExtension has been created at:

  ${chalk.bold(chalk.green(targetDir))} ${MORE_INFO_MSG}`;

      const result = await main({
        dirPath: projName,
        baseDir: tmpPath,
      });
      expect(result.projectPath).toEqual(targetDir);
      expect(result.projectCreatedMessage).toEqual(expectedMessage);
    })
  );

  test("creates files, readme and manifest with correct name", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);

      const result = await main({
        dirPath: projName,
        baseDir: tmpPath,
      });

      const contentStat = await fs.stat(path.join(targetDir, "content.js"));
      expect(contentStat.isDirectory()).toBeFalsy();

      const bgStat = await fs.stat(path.join(targetDir, "background.js"));
      expect(bgStat.isDirectory()).toBeFalsy();

      const rmStat = await fs.stat(path.join(targetDir, "README.md"));
      expect(rmStat.isDirectory()).toBeFalsy();

      const manifest = await fs.readFile(path.join(targetDir, "manifest.json"), "utf-8");
      const parsed = JSON.parse(manifest);
      expect(parsed.name).toEqual(projName);
    })
  );
});
