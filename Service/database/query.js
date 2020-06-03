const db = require('index.js');

const handleError = (res) => {
  return (err) => {
    res.status(500).send(err);
  };
};

const findRoomById = (req, res) => {
  // result is an array

  const { room_id } = req.body;

  Rooms.find({ room_id })
    .then((results) => {
      const [room] = results;

      room ? res.send({}) : res.send(rooom);
    })
    .catch(handleError(res));
};

module.exports.query = {
  findRoomById,
};
