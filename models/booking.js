const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        bookingId: {
            type: Number,
            require: true,
            unique: [true, "L'identifiant de la réservation doit être unique"]
        },

        catwayNumber: {
            type: Number,
            require: true
        },

        clientName: {
            type: String,
            trim: true,
            require: true
        },

        boatName: {
            type: String,
            trim: true,
            require: true
        },

        checkIn: {
            type: Date,
            require: true
        }, 

        checkOut: {
            type: Date,
            require: true
        }
    }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;