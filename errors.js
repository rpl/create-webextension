const ES6Error = require("es6-error");

exports.onlyInstancesOf = function (errorType, handler) {
  return (error) => {
    if (error instanceof errorType) {
      return handler(error);
    }
    throw error;
  };
};

exports.UsageError = class UsageError extends ES6Error {};
