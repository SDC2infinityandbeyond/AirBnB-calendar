const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));
const Rooms = require('./rooms.js');

const parent = Rooms.modelName;
const child = 'Reservations';
const { Schema } = mongoose;

// child schema
const reservations_schema = new Schema({
  reservation_id: {
    type: Number,
    unique: true,
    required: true,
  },
  room_id: {
    type: Number,
    ref: parent,
    required: true,
  },
  check_in: {
    type: Date,
    required: true,
  },
  check_out: {
    type: Date,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  }
});

// model
const Reservations = mongoose.model(child, reservations_schema);

module.exports = Reservations;
