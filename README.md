<!-- https://docs.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance?view=azure-devops -->

# HRSF127 SDC Group 2: 2-infinity-and-beyond

## 1. Getting Started

```sh
  cd Service/
  npm install
```

## 2. Generate CSV Files

```sh
  npm run csv:airbnb
```

## 3. Seeding

### PostgreSQL

```sh
  npm run sql:seed
```

1. Start _psql_ shell as *__postgres__* in a new terminal

```sh
    psql -U postgres
```

2. Enter the following commands into the _psql_ command prompt

```sh
    \c airbnb
    ALTER TABLE reservations ADD CONSTRAINT reservations_fk FOREIGN KEY (room_id) REFERENCES rooms (room_id) ON DELETE CASCADE;
    CREATE INDEX rooms_room_id on rooms (room_id);
    CREATE INDEX reservations_reservation_id ON reservations (reservation_id);
    CREATE INDEX reservations_room_id ON reservations (room_id);
```

### MongoDB

```sh
  npm run nosql:seed
```

1. Start _mongo_ shell in a new terminal

```sh
    mongo
```

2. Enter the following commands into the _mongo_ command prompt

```sh
    use airbnb;
    db.rooms.createIndex( { room_id: 1 } )
    db.reservations.createIndex( { reservation_id: 1 } )
    db.reservations.createIndex( { room_id: 1 } )
```

## 4. Start the NodeJS Server

```sh
  npm run server-dev
```

## Server API

### Get pricing, fees, and room info

* GET `/rooms/:id`

**Path Parameters:**

* `id` room id

**Success Status Code:** `200`

**Returns:** JSON

```json
    {
      "room_id": "Number",
      "nightly_rate": "Number",
      "person_capacity": "Number",
      "cleaning_fee": "Number",
      "service_fee": "Number",
      "tax_rate": "Number",
    }
```

### Add reservation

* POST `/rooms/:id/reservation`

**Success Status Code:** `201`

**Request Body**: Expects JSON with the following keys.

```json
    {
      "room_id": "Number",
      "check_in": "Date",
      "check_out": "Date",
      "total": "Number",
    }
```

### Get reservation info

* GET `/reservation/:reserve_id`

**Path Parameters:**

* `room_id` room id
* `reserve_id` reservation id

**Success Status Code:** `200`

**Returns:** JSON

```json
    {
      "reservation_id": "Number",
      "room_id": "Number",
      "check_in": "Date",
      "check_out": "Date",
      "total": "Number",
    }
```

<!-- ### Update room info

* PATCH `/rooms/:room_id/`

**Path Parameters:**

* `room_id` room id

**Success Status Code:** `204`

**Request Body**: Expects JSON with any of the following keys (include only keys to be updated)

```json
    {
      "nightly_rate": "Number",
      "person_capacity": "Number",
      "cleaning_fee": "Number",
      "service_fee": "Number",
    }
```

### Delete reserveration

* DELETE `rooms/:room_id/reservation/:reservation_id`

**Path Parameters:**

* `reservation_id` reservation id
* `room_id` room id

**Success Status Code:** `204` -->

---

## NoSQL Schema

### Import modules and dependencies

```js
    const mongoose = require('mongoose');

    const { Schema } = mongoose;
```

### Reservations schema (primary concern)

```js
    const reservations_schema = new Schema({
      reservation_id: {
        type: Number,
        unique: true,
        required: true,
      },
      room_id: {
        type: Number,
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
      total: {
        type: Number,
        required: true,
      }
    });
```

### Rooms schema (secondary concern)

```js
  const rooms_schema = new Schema({
    room_id: {
      type: Number,
      unique: true,
      required: true,
    },
    reservations: [Number], // array of reservation id's
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
    cleaning_fee: {
      type: Number,
      required: true,
    },
    service_fee: {
      type: Number,
      required: true,
    },
    tax_rate: {
      type: Number,
      required: true,
    },
});
```

### Export Mongoose models

```js
    const Rooms = mongoose.model('Rooms', rooms_schema);
    const Reservations = mongoose.model('Reservations', reservations_schema);

    module.exports = {
      Rooms,
      Reservations,
    };
```
