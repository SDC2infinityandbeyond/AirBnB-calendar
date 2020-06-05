const colors = require('colors');
const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));

// conn configuration
const SERVER = '127.0.0.1:27017';
const DB = 'airbnb';
const URI = `mongodb://${SERVER}/${DB}`;
const OPTIONS = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  poolSize: 5,
};

// initial conn and handle initial conn errors
mongoose.connect(URI, OPTIONS)
  .then(() => console.log(`Connected to ${colors.green('MongoDB')}`))
  .catch(console.error);

// conn to database
const db = mongoose.connection;

// handle errors after initial conn was established by listening for error events on the conn
db.on('error', (err) => console.error(err));

// successful conn
db.once('open', () => {
  console.log(`Using database ${db.name.green}`);
});

module.exports.db;
