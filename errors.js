const ES6Error = require("es6-error");

exports.onlyInstancesOf = function(errorType, handler) {
  return(error) => {
    if (error instanceof errorType) {
      return handler(error);
    } else {
      console.log(error.stack);
      process.exit(1);
    }
  }
}

exports.UsageError = class UsageError extends ES6Error {
  constructor(message) {
    super(message);
  }
}
