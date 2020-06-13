require('dotenv').config();
const path = require('path');
const Promise = require('bluebird');
const appendFile = Promise.promisify(require('fs').appendFile);
const exec = Promise.promisify(require('child_process').exec);

const host = process.env.PSQL_HOST || '127.0.0.1';
const port = process.env.PSQL_PORT || 5432;
const infile = path.join(__dirname, './schema.sql');
const command = `psql -h ${host} -p ${port} -U postgres -f ${infile} || exit 1`;

console.log(command);

const start = Date.now();

exec(command)
  .then((stdout) => {
    // log statistics
    const stop = Date.now();
    const elapsed = Math.abs(stop - start) / 1000;
    const day = new Date().toDateString();
    const time = new Date(stop).toTimeString();
    const lines = stdout.replace(/\r/g, '').split('\n').reduce((accum, value) => {
      accum += value !== '' ? `\t${value}\n` : ''; 
      return accum;
    }, '');
    const message = `Command: ${command}\nDate: ${day}\nTime: ${time}\nExecution Time: ${elapsed} seconds\nOutput: \n${lines}\n`;
    
    // log results to terminal
    console.log(stdout);

    // log results to log file
    const log_file = path.join(__dirname, './seed-log/airbnb.sql.log');

    appendFile(log_file, message, 'utf8')
      .then(() => console.log('Done'))
      .catch(console.error);

  })
  .catch(console.error);
