require('newrelic');
require('dotenv').config();
const colors = require('colors');
const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const morgan = require('morgan');
const path = require('path');
const spdy = require('spdy');
const query = require('../database/query.js');
const options = require('./config.js');

const port = process.env.NODE_SERVER_PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(morgan('dev'));
app.use('/', expressStaticGzip(`${__dirname}/../client/dist`));

app.get('/data', (req, res) => {
  const data = [
    0,
    1,
    2,
    3,
    {
      guest_limit: 16,
      cleaning_fee: 100,
      service_fee: 50,
      tax: 5,
      price: 75,
      reviews: 200,
      rating: 4.5,
    },
  ];

  res.send(data); 
});
app.get('/rooms/:room_id', query.findRoomById);
app.get('/reservations/:reservation_id', query.findReservationById);
app.post('/reservations', query.insertReservation);

spdy.createServer(options, app).listen(port, (err) => {
  err ? console.log(err) : console.log(`HTTP SPDY server listening on port ${port}`)
});
