"use strict";

const path = require("path");
const exec = require("child_process").exec;
const fs = require("mz/fs");
const promisify = require("es6-promisify");
const linter = require("addons-linter");
const withTmpDir = require("./helpers/tmp-dir").withTmpDir;

const promisifiedExec = promisify(exec);

const homeDir = process.cwd();
const execDirPath = path.join(__dirname, "..", "bin");
const nodeBin = process.execPath.replace(" ", '\ ');

describe("main", () => {

  test("creates files including manifest with correct name", () => withTmpDir(
    (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);

      const cmd = `${nodeBin} ${execDirPath}/create-webextension ${targetDir}`;
      return promisifiedExec(cmd)
      .then(() => {
        return fs.stat(path.join(targetDir, "content.js"))
        .then((contentstat) => {
          expect(contentstat.isDirectory()).toBeFalsy();
          return fs.stat(path.join(targetDir, "background.js"))
          .then((bgstat) => {
            expect(bgstat.isDirectory()).toBeFalsy();
            return fs.readFile(path.join(targetDir, "manifest.json"), "utf-8")
            .then((data) => {
              const parsed = JSON.parse(data);
              expect(parsed.name).toEqual(projName);
            });
          });
        });
      });
    })
  );

  test("created project is linted correctly", () => withTmpDir(
    (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);

      const cmd = `${nodeBin} ${execDirPath}/create-webextension ${targetDir}`;
      return promisifiedExec(cmd)
      .then(() => {
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
        return linterInstance.run()
        .then((instance) => {
          const summary = {
            errors: 0,
            notices: 0,
            warnings: 0,
          };
          expect(instance.summary).toEqual(summary);
        })
        .catch((err) => console.error("addons-linter failure: ", err));
      });
    })
  );
});
