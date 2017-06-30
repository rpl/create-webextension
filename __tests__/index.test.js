"use strict";

const path = require("path");
const fs = require("mz/fs");
const linter = require("addons-linter");
const withTmpDir = require("./helpers/tmp-dir");
const cmdRunner = require("./helpers/cmd-runner");

const execDirPath = path.join(__dirname, "..", "bin");

describe("main", () => {
  test("creates files including manifest with correct name", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);

      const cmd = await cmdRunner([`${execDirPath}/create-webextension`, `${targetDir}`]);

      if (cmd.exitCode !== 0) {
        throw new Error(`Command Run Failed: ${cmd.stderr}`);
      }

      const contentStat = await fs.stat(path.join(targetDir, "content.js"));
      expect(contentStat.isDirectory()).toBeFalsy();

      const bgStat = await fs.stat(path.join(targetDir, "background.js"));
      expect(bgStat.isDirectory()).toBeFalsy();

      const manifest = await fs.readFile(path.join(targetDir, "manifest.json"), "utf-8");
      const parsed = JSON.parse(manifest);
      expect(parsed.name).toEqual(projName);
    })
  );

  test("created project is linted correctly", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);

      const cmd = await cmdRunner([`${execDirPath}/create-webextension`, `${targetDir}`]);

      if (cmd.exitCode !== 0) {
        throw new Error(`Command Run Failed: ${cmd.stderr}`);
      }

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

      const instance = await linterInstance.run();
      expect(instance.summary).toEqual(summary);
    })
  );
});
