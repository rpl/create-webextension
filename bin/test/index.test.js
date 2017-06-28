"use strict";

const path = require("path");
const fs = require("mz/fs");
const tmp = require("tmp");
const promisify = require("es6-promisify");
const linter = require("addons-linter");

const createTempDir = promisify(tmp.dir, {multiArgs: true});

const homeDir = process.cwd();

describe("main", () => {
  test("creates files including manifest with correct name", () => {
    return createTempDir(
      {
        prefix: "tmp-create-web-ext",
        // This allows us to remove a non-empty tmp dir.
        unsafeCleanup: true,
      })
      .then((args) => {
        const [tmpPath, removeTempDir] = args;
        const projName = "target";
        const targetDir = path.join(tmpPath, "target");
        console.log(`Created temporary directory: ${tmpPath}`);
        process.chdir(tmpPath);

        const exec = require("child_process").exec;
        const cmd = `create-webextension ${projName}`;
        return new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
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
                  })
                  .then(() => {
                    removeTempDir();
                    process.chdir(homeDir);
                    resolve();
                  });
                });
              });
            }
          });
        });
      });
  });

  test("created project is linted correctly", () => {
    return createTempDir(
      {
        prefix: "tmp-create-web-ext",
        // This allows us to remove a non-empty tmp dir.
        unsafeCleanup: true,
      })
      .then((args) => {
        const [tmpPath, removeTempDir] = args;
        const projName = "target";
        const targetDir = path.join(tmpPath, "target");
        console.log(`Created temporary directory: ${tmpPath}`);
        process.chdir(tmpPath);

        const exec = require("child_process").exec;
        const cmd = `create-webextension ${projName}`;
        return new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            console.log("exec");
            if (error) {
              reject(error);
            } else {
              const config = {
                _: [targetDir],
                logLevel: 'debug',
                stack: false,
                pretty: true,
                warningsAsErrors: false,
                metadata: false,
                output: 'none',
                boring: false,
                selfHosted: false,
                shouldScanFile: (fileName) => true,
              };
              const linterInstance = linter.createInstance({
                config,
                runAsBinary:false,
              });
              return linterInstance.run()
              .then((instance) => {
                const summary = {
                  errors: 0,
                  notices: 0,
                  warnings: 0,
                };
                expect(instance.summary).toEqual(summary);
                resolve();
              })
            }
          });
        });
      });
  });
});
