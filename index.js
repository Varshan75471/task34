const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON

// Arrays to hold room and booking details
let rooms = [];
let bookings = [];

// Create a room
app.post('/rooms', (req, res) => {
  const { name, seats, amenities, price } = req.body;

  // Validation
  if (!name || !seats || !amenities || !price) {
    return res.status(400).send({ message: 'All fields are required (name, seats, amenities, price)' });
  }

  const room = {
    id: rooms.length + 1,
    name,
    seats,
    amenities,
    price,
  };

  rooms.push(room);
  res.status(201).send({ message: 'Room created successfully', room });
});

// Book a room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  // Validation
  if (!customerName || !date || !startTime || !endTime || !roomId) {
    return res.status(400).send({ message: 'All fields are required (customerName, date, startTime, endTime, roomId)' });
  }

  // Check if the room exists
  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return res.status(404).send({ message: 'Room not found' });
  }

  // Check if the room is already booked
  const isBooked = bookings.some(
    (booking) =>
      booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime))
  );

  if (isBooked) {
    return res.status(400).send({ message: 'Room is already booked for the given time slot' });
  }

  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };

  bookings.push(booking);
  res.status(201).send({ message: 'Room booked successfully', booking });
});

// List all rooms with booking data
app.get('/rooms', (req, res) => {
  const result = rooms.map((room) => {
    const roomBookings = bookings.filter((booking) => booking.roomId === room.id);
    return {
      ...room,
      bookings: roomBookings,
    };
  });

  res.status(200).send(result);
});

// List all customers with booking data
app.get('/customers', (req, res) => {
  const result = bookings.map((booking) => {
    const room = rooms.find((r) => r.id === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room ? room.name : 'Unknown Room',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });

  res.status(200).send(result);
});

// List customer booking count
app.get('/customers/:customerName/bookings', (req, res) => {
  const { customerName } = req.params;

  const customerBookings = bookings.filter((booking) => booking.customerName === customerName);

  if (customerBookings.length === 0) {
    return res.status(404).send({ message: 'No bookings found for the customer' });
  }

  res.status(200).send({
    customerName,
    bookingCount: customerBookings.length,
    bookings: customerBookings,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
