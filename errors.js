const ES6Error = require("es6-error");

exports.onlyInstancesOf = function (errorType, handler) {
  return (error) => {
    if (error instanceof errorType) {
      return handler(error);
    // eslint-disable-next-line no-else-return
    } else {
      console.log(error.stack);
      process.exit(1);
    }
  };
};

exports.UsageError = class UsageError extends ES6Error {
  // eslint-disable-next-line  no-useless-constructor
  constructor(message) {
    super(message);
  }
};
