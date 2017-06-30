const tmp = require("tmp");
const promisify = require("es6-promisify");

const createTempDir = promisify(tmp.dir, {multiArgs: true});

module.exports = function withTmpDir(testPromise) {
  return createTempDir({
    prefix: "tmp-create-web-ext-",
    // This allows us to remove a non-empty tmp dir.
    unsafeCleanup: true,
  })
  .then(([tmpPath]) => {
    return testPromise(tmpPath);
  });
};
