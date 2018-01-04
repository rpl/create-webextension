"use strict";

const path = require("path");
const fs = require("mz/fs");
const withTmpDir = require("../helpers/tmp-dir");
const UsageError = require("../../errors").UsageError;
const main = require("../../index").main;
const getProjectCreatedMessage =
  require("../../index").getProjectCreatedMessage;

describe("main", () => {
  test("returns project path and creation message", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);
      const dirname = path.join(__dirname, "..", "..");
      const expectedMessage = await getProjectCreatedMessage(targetDir, dirname);

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
      expect(contentStat.isFile()).toBeTruthy();

      const bgStat = await fs.stat(path.join(targetDir, "background.js"));
      expect(bgStat.isFile()).toBeTruthy();

      const rmStat = await fs.stat(path.join(targetDir, "README.md"));
      expect(rmStat.isFile()).toBeTruthy();

      const manifest = await fs.readFile(path.join(targetDir, "manifest.json"), "utf-8");
      const parsed = JSON.parse(manifest);
      expect(parsed.name).toEqual(projName);
    })
  );

  test("calls all of its necessary dependencies", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";

      jest.mock("../../dependencies-main");
      const mockedDependencies = require("../../dependencies-main");

      await main({
        dirPath: projName,
        baseDir: tmpPath,
        deps: mockedDependencies,
      });

      expect(mockedDependencies.getProjectManifest.mock.calls.length).toBe(1);
      expect(mockedDependencies.getProjectManifest.mock.calls[0][0]).toBe(projName);

      expect(mockedDependencies.getPlaceholderIcon.mock.calls.length).toBe(1);

      expect(mockedDependencies.getProjectReadme.mock.calls.length).toBe(1);
      expect(mockedDependencies.getProjectReadme.mock.calls[0][0]).toBe(projName);
    })
  );

  test("throws Usage Error when directory already exists", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";
      const targetDir = path.join(tmpPath, projName);
      await fs.mkdir(targetDir);

      await expect(main({
        dirPath: projName,
        baseDir: tmpPath,
      })).rejects
      .toBeInstanceOf(UsageError);

      await expect(main({
        dirPath: projName,
        baseDir: tmpPath,
      })).rejects.toMatchObject({
        message: expect.stringMatching(/dir already exists/),
      });
    })
  );

  test("throws error when one of dependencies throws", () => withTmpDir(
    async (tmpPath) => {
      const projName = "target";

      jest.mock("../../dependencies-main");

      const mockedDependencies = require("../../dependencies-main");

      mockedDependencies.getPlaceholderIcon = jest.fn(() => {
        throw new Error("unexpected dependency error");
      });

      await expect(main({
        dirPath: projName,
        baseDir: tmpPath,
        deps: mockedDependencies,
      })).rejects.toMatchObject({
        message: expect.stringMatching(/unexpected dependency error/),
      });
    })
  );
});

describe("getProjectCreatedMessage", () => {
  test("returns message with correct directory", async () => {
    const targetDir = path.join("target");
    const returnedMessage = await getProjectCreatedMessage(targetDir);

    expect(returnedMessage).toMatch(new RegExp(targetDir));
  });
});
