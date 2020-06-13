// import modules
const _ = require('underscore');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

// promisify fs appendFile method
const appendFile = Promise.promisify(fs.appendFile);

const logger = (writer, time_init, time_final, rooms, reservations_per_room, num_partitions) => {
  const time_delta = Math.abs(time_final - time_init) / 1000;
  write_time += time_delta;
  const num_records = (rooms * reservations_per_room) / num_partitions;
  const speed = num_records / time_delta;

  const statistics = `
\tFile: ${writer.path}
\tNo. Records: ${num_records}
\tWrite Time: ${time_delta.toFixed(3)} seconds
\tWrite Speed: ${speed.toFixed(3)} records/second
`;

  return statistics;
};

const generate_csv = (write_streams, num_partitions, encoding, callback, tbl_name) => {
  /* random data initialization */
  const rooms = 10_000_000;
  const person_capacity = _.range(1, 16 + 1); // 1 to 16 inclusive
  const nightly_rate = _.range(50, 201, 5);
  const tax_rate = _.range(0, 10).reduce((accum, whole) => { // 0.00 to 9.75 in 0.25 increments; 40 elements
    [0.00, 0.25, 0.50, 0.75].forEach((fract) => {
      accum.push(whole + fract);
    });

    return accum;
  }, []);

  // 'rooms' table configuration
  let reservations_per_room = 1;
  let fields = ['room_id', 'nightly_rate', 'person_capacity', 'tax'];
  
  // start indices
  let room_id = 0;
  let reservation_id = null;
  let night_index = -1;
  let tax_index = -1;
  let person_index = -1;

  let two_weeks_in_milliseconds = null;
  let two_weeks_in_days = null;
  let one_day_in_milliseconds = null;
  let check_in = null;
  let rotate = null;

  // 'rooms' table configuration
  if (tbl_name === 'reservations') {
    reservations_per_room = 10;
    fields = ['reservation_id', 'room_id', 'check_in', 'check_out', 'cost'];
    two_weeks_in_milliseconds = 2 * 7 * 24 * 60 * 60 * 10 ** 3;
    two_weeks_in_days = 2 * 7;
    one_day_in_milliseconds = 24 * 60 * 60 * 10 ** 3;
    
    // first check_in 
    check_in = new Date(new Date().toISOString().split('T').shift());
    
    
    // variable to know when to increment room_id
    rotate = 0;

    // start indices
    reservation_id = 0;
    room_id = 1;
    night_index = 0;
    tax_index = 0;
    person_index = 0;
  }

  // initialize variable to log statistics of each paritioned file
  let logs = '';

  // variables to know when to start and halt do-while loop execution
  let iteration = tbl_name === 'reservations' 
    ? reservation_id
    : room_id; 
  const stop = rooms * reservations_per_room;

  // initialize first write stream
  let stream_index = 0;
  let writer = write_streams[stream_index];
  
  // start first write 
  let time_init = Date.now();
  writer.write(`${fields}\n`, encoding);

  const write = () => {
    let ok = true;
    do {
      iteration += 1;

      if (tbl_name !== 'reservations') {
        night_index += 1;
        person_index += 1;
        tax_index += 1;
  
        // reset indices
        night_index = night_index === nightly_rate.length ? 0 : night_index;
        person_index = person_index === person_capacity.length ? 0 : person_index;
        tax_index = tax_index === tax_rate.length ? 0 : tax_index;
  
        data = `${iteration},${nightly_rate[night_index]},${person_capacity[person_index]},${tax_rate[tax_index]}\n`;
      }

      if (tbl_name === 'reservations') {
        rotate += 1;

        let check_out = new Date(check_in.valueOf() + two_weeks_in_milliseconds);
        let multiplier = person_capacity[person_index] > 1 ? [1.0, 1.15][_.random(0, 1)] : 1.0; // e.g. Adults only, Adults + Children
        let cost = (nightly_rate[night_index] * two_weeks_in_days * multiplier * (1 + tax_rate[tax_index] * 10 ** -2)).toFixed(2);

        data = `${iteration},${room_id},${check_in.toISOString().split('T').shift()},${check_out.toISOString().split('T').shift()},${cost}\n`;
        check_in = new Date(check_out.valueOf() + one_day_in_milliseconds);

        // increment room_id
        if (rotate === reservations_per_room) {
          rotate = 0;
          room_id += 1;
          night_index += 1;
          tax_index += 1;
          person_index += 1;
          check_in = new Date(new Date().toISOString().split('T').shift());
        }

        // reset indices
        night_index = night_index === nightly_rate.length ? 0 : night_index;
        person_index = person_index === person_capacity.length ? 0 : person_index;
        tax_index = tax_index === tax_rate.length ? 0 : tax_index;

      }
      
      if (iteration === stop) {
        // log statistics for last stream
        const time_final = Date.now();
        logs += logger(writer, time_init, time_final, rooms, reservations_per_room, num_partitions);

        writer.write(data, encoding, callback(writer, logs, rooms, reservations_per_room, tbl_name, fields));
      } else {
        ok = writer.write(data, encoding);
      }

      // partition csv file
      if (
        stream_index + 1 !== num_partitions
        && iteration === stop * ((stream_index + 1) / num_partitions)
      ) {
        // log statistics for current stream
        const time_final = Date.now();
        logs += logger(writer, time_init, time_final, rooms, reservations_per_room, num_partitions);

        // get next write stream
        stream_index += 1;
        writer = write_streams[stream_index];

        // reset start time
        time_init = Date.now();

        // initialize headers
        writer.write(`${fields}\n`, encoding);
      }

    } while (iteration < stop && ok);
    if (iteration < stop) {
      writer.once('drain', write);
    }
  };

  write();

};

const callback = (writer, logs, rooms, reservations_per_room, tbl_name, fields) => {
  const date = new Date();
  const num_records = rooms * reservations_per_room;
  const speed = num_records / write_time; 
  const statistics = `Files:
${logs}
Date: ${date.toDateString()}
Time: ${date.toTimeString()}
No. Fields: ${fields.length}
No. Records: ${num_records}
Write Time: ${write_time.toFixed(3)} seconds
Write Speed: ${speed.toFixed(3)} records/second
\n\n\n\n\n`;

  // output statistics to terminal
  console.log(statistics);

  // create log file
  const log_file = path.join(__dirname, `../log/${tbl_name}.log`);

  // write statistics to log file
  appendFile(log_file, statistics, 'utf8')
    .then(() => console.log('Done'))
    .catch(console.error);


  // close last write stream
  return () => {
    writer.end();
  };
};

/* csv file generator configuration */
const tables = {
  rooms: {
    partitions: 1 // 2
  },
  reservations: {
    partitions: 10,
  }
}

// encoding
const encoding = 'utf8';

// global counter to compute sum of write times
let write_time = 0;

Object.entries(tables).forEach(([tbl_name, config]) => {
  let num_partitions = config.partitions;
  let write_streams = _.range(1, num_partitions + 1).map((file_number) => fs.createWriteStream(path.join(__dirname, `../${tbl_name}${file_number}.csv`)));
  generate_csv(write_streams, num_partitions, encoding, callback, tbl_name);
});
