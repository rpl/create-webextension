"use strict";

const path = require("path");
const chalk = require("chalk");
const fs = require("mz/fs");
const withTmpDir = require("../helpers/tmp-dir");
const onlyInstancesOf = require("../../errors").onlyInstancesOf;
const UsageError = require("../../errors").UsageError;
const main = require("../../index").main;
const MORE_INFO_MSG = require("../../index").MORE_INFO_MSG;
const asciiLogo = require("../../index").asciiLogo;

describe("main", () => {
  test("returns project path and creation message", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);
      const expectedMessage =
      `${asciiLogo} \n
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

      await main({
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

  test("calls all of its necessary dependencies", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);

      const getProjectManifestMock = jest.fn();
      const getPlaceholderIconMock = jest.fn();
      const getProjectReadmeMock = jest.fn();
      const getProjectCreatedMessageMock = jest.fn();

      await main({
        dirPath: projName,
        baseDir: tmpPath,
        getProjectManifestFn: getProjectManifestMock,
        getPlaceholderIconFn: getPlaceholderIconMock,
        getProjectReadmeFn: getProjectReadmeMock,
        getProjectCreatedMessageFn: getProjectCreatedMessageMock,
      });

      expect(getProjectManifestMock.mock.calls.length).toBe(1);
      expect(getProjectManifestMock.mock.calls[0][0]).toBe(projName);

      expect(getPlaceholderIconMock.mock.calls.length).toBe(1);

      expect(getProjectReadmeMock.mock.calls.length).toBe(1);
      expect(getProjectReadmeMock.mock.calls[0][0]).toBe(projName);

      expect(getProjectCreatedMessageMock.mock.calls.length).toBe(1);
      expect(getProjectCreatedMessageMock.mock.calls[0][0]).toBe(targetDir);
    })
  );

  test("throws Usage Error when directory already exists", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);
      await fs.mkdir(targetDir);

      try {
        await main({
          dirPath: projName,
          baseDir: tmpPath,
        });
      } catch (error) {
        onlyInstancesOf(UsageError, () => {
          expect(error.message).toMatch(/dir already exists/);
        });
      }
    })
  );

  test("throws error when directory already exists", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const getPlaceholderIconMock = jest.fn(() => {
        throw new Error("error");
      });

      try {
        await main({
          dirPath: projName,
          baseDir: tmpPath,
          getPlaceholderIconFn: getPlaceholderIconMock,
        });
      } catch (error) {
        expect(error.message).toMatch(/error/);
      }
    })
  );
});
