const tmp = require("tmp");
const promisify = require("es6-promisify");

const createTempDir = promisify(tmp.dir, {multiArgs: true});

exports.withTmpDir = function withTmpDir(makePromise) {
  return createTempDir({
      prefix: "tmp-web-ext-",
      // This allows us to remove a non-empty tmp dir.
      unsafeCleanup: true,
    })
    .then(([tmpPath,]) => {
      return makePromise(tmpPath);
    });
};
