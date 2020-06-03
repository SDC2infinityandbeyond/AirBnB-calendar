const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));

const parent = 'Rooms';
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

// model
const Rooms = mongoose.model(parent, rooms_schema);

module.exports = Rooms;
