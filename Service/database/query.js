const colors = require('colors');
const db = require('./index.js');
const Rooms = require('./models/rooms.js');
const Reservations = require('./models/reservations.js');

const handleError = (res) => {
  return (err) => {
    console.error(`${err}`.red);
    res.status(500).send(err);
  };
};

const findRoomById = (req, res) => {
  const { room_id } = req.params;
  
  // {Array} results 
  Rooms.find({ room_id })
    .then((results) => {
      const [room] = results;

      room ? res.send(room) : res.send({});
    })
    .catch(handleError(res));

};

const findReservationById = (req, res) => {
  const { reservation_id } = req.params;

  Reservations.find({ reservation_id })
    .then((results) => {
      const [room] = results;

      room ? res.send(room) : res.send({});
    })
    .catch(handleError(res));
};

const isValidRoom = async (room_id) => {
  const promise = new Promise((resolve, reject) => {
    Rooms.find({ room_id }, (err, results) => {
      err ? reject(err) : resolve(results);
    });
  });

  const [room] = await promise;

  return room ? true : false;
};

const getReservationsCount = async () => {
  const count = new Promise((resolve, reject) => {
    Reservations.estimatedDocumentCount({}, (err, count) => {
      err ? reject(err) : resolve(count);
    });
  });
  
  return await count;
};

const getReservationsByRoomId = (room_id) => {
  Reservations.find({ room_id }, (err, results) => {
    err ? console.error(err) : console.log(results);
  });
};

// db.reservations.deleteOne({_id: ObjectId("5ed99d914409b31c54d9d584")})
// db.reservations.deleteOne({_id: ObjectId("5ed99c555e41101c7c22fa41")})
// db.reservations.deleteOne({_id: ObjectId("5ed99b9bf16e84112c0e1ebc")})
// db.reservations.deleteOne({_id: ObjectId("5ed99b9af16e84112c0e1ebb")})
// db.reservations.deleteOne({_id: ObjectId("5ed99b98f16e84112c0e1eba")})
// db.reservations.deleteOne({_id: ObjectId("5ed99b97f16e84112c0e1eb9")})
// db.reservations.deleteOne({_id: ObjectId("5ed99b96f16e84112c0e1eb8")})
// db.reservations.deleteOne({_id: ObjectId("5ed99b93f16e84112c0e1eb7")})
// db.reservations.deleteOne({_id: ObjectId("5ed99b8ef16e84112c0e1eb6")})
// db.reservations.deleteOne({_id: ObjectId("5ed99a3a490e823d642f58b2")})
// db.reservations.deleteOne({_id: ObjectId("5ed99a1e490e823d642f58b1")})
// db.reservations.deleteOne({_id: ObjectId("5ed995eb4e63a6170cf11c78")})
// db.reservations.deleteOne({_id: ObjectId("5ed9953c0aed3f0a282e029c")})
// db.reservations.deleteOne({_id: ObjectId("5ed9340340085f35382b87fe")})
// db.reservations.find().limit(15).sort({$natural:-1}).pretty()

const insertReservation = async (req, res) => {
  const reservation = req.body;
  const { room_id } = reservation;

  try {
    if (await isValidRoom(room_id)) {
      reservation.reservation_id = await getReservationsCount() + 1;

      getReservationsByRoomId(reservation.room_id);

      new Reservations(reservation).save()
        .then((confirmation) => res.send(confirmation))
        .catch(handleError(res));

    } else {
      console.error(`Error: invalid room { room_id: ${room_id} }`.red);
      res.status(500).send({ err: `invalid room { room_id: ${room_id} }` });
    }
  } catch(err) {
    console.error(`${err}`.red);
    res.status(500).send(err);
  }
};

const query = {
  findRoomById,
  findReservationById,
  insertReservation,
};

module.exports = query;
