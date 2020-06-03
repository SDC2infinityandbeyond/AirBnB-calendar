const colors = require('colors');
const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));

const parent = 'Rooms';
const child = 'Reservations';
const { Schema } = mongoose;

// parent schema
const rooms_schema = new Schema({
  room_id: Schema.Types.ObjectId,
  nightly_rate: {
    type: Number, 
    required: true,
  },
  person_capacity: {
    type: Number, 
    required: true,
    min: 1,
    max: 16,
  },
  tax_rate: {
    type: Number, 
    required: true,
  },
});

// child schema
const reservations_schema = new Schema({
  reservation_id: Schema.Types.ObjectId,
  room_id: {
    type: Schema.Types.ObjectId,
    ref: parent,
  },
  check_in: {
    type: Date,
    required: true,
  },
  check_out: {
    type: Date,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  }
});

// models
const Rooms = mongoose.model(parent, rooms_schema);
const Reservations = mongoose.model(child, reservations_schema);

// conn configuration
const SERVER = '127.0.0.1:27017';
const DB = 'airbnb';
const URI = `mongodb://${SERVER}/${DB}`;
const OPTIONS = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

// initial conn and handle initial conn errors
mongoose.connect(URI, OPTIONS)
  .then(() => console.log(`Connected to ${colors.green('MongoDB')}`))
  .catch(console.error);

// conn to database
const { connection } = mongoose;

// handle errors after initial conn was established by listening for error events on the conn
connection.on('error', (err) => console.error(err));

// successful conn
connection.once('open', () => {
  console.log(`Using database ${connection.name.green}`);
});

module.exports = {
  connection,
  Reservations,
  Rooms,
};
