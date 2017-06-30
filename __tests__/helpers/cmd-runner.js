const {spawn} = require("child_process");

module.exports = function cmdRunner(cmdArgs) {
  const spawnedProcess = spawn(
    process.execPath, cmdArgs,
  );

  return new Promise((resolve) => {
    let errorData = "";
    let outputData = "";

    spawnedProcess.stderr.on("data", (data) => {
      errorData += data;
    });
    spawnedProcess.stdout.on("data", (data) => {
      outputData += data;
    });

    spawnedProcess.on("close", (exitCode) => {
      resolve({
        exitCode,
        stderr: errorData,
        stdout: outputData,
      });
    });
  });
};
