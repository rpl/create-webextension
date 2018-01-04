"use strict";

const UsageError = require("../../errors").UsageError;
const onlyInstancesOf = require("../../errors").onlyInstancesOf;

describe("onlyInstancesOf", () => {
  test("catches specified error", () => {
    return Promise.reject(new UsageError("fake usage error"))
      .catch(onlyInstancesOf(UsageError, (error) => {
        expect(error).toBeInstanceOf(UsageError);
      }));
  });

  test("throws other errors", () => {
    return Promise.reject(new Error("fake error"))
      .catch(onlyInstancesOf(UsageError, () => {
        throw new Error("Unexpectedly caught the wrong error");
      }))
      .catch((error) => {
        expect(error.message).toMatch(/fake error/);
      });
  });
});
