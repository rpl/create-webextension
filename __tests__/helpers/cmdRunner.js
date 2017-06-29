const {spawn} = require("child_process");

module.exports = function cmdRunner(cmd) {
  const spawnedProcess = spawn(
    process.execPath, [cmd],
  );

  const waitForExit = new Promise((resolve) => {
    spawnedProcess.on('close', (exitCode) => {
      resolve({
        exitCode,
      });
    });
  });

  return {waitForExit, spawnedProcess};
}
