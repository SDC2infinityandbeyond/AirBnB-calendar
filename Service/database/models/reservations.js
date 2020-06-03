const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));
const Rooms = require('./rooms.js');

const parent = Rooms.modelName;
const child = 'Reservations';
const { Schema } = mongoose;

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

// model
const Reservations = mongoose.model(child, reservations_schema);

module.exports = Reservations;
