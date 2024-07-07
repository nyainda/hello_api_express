const { exec } = require('child_process');

module.exports = async () => {
  await new Promise((resolve, reject) => {
    exec('npm run migrate up', (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${stderr}`);
        reject(error);
      } else {
        console.log(`Migration output: ${stdout}`);
        resolve();
      }
    });
  });
};
