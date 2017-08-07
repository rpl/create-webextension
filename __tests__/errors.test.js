"use strict";

const UsageError = require("../errors").UsageError;
const onlyInstancesOf = require("../errors").onlyInstancesOf;

describe("onlyInstancesOf", () => {
  test("catches specified error", () => {
    return Promise.reject(new UsageError("fake usage error"))
      .catch(onlyInstancesOf(UsageError, (error) => {
        expect(error).toBeInstanceOf(UsageError);
      }));
  });
});
