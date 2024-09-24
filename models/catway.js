const mongoose = require('mongoose');

const catwaySchema = mongoose.Schema(
    {
        catwayNumber: {
            type: Number,
            require: true
        },

        type: {
            type: String,
            require: true,
            lowercase: true,
            trim: true,
            enum: ['long', 'short'],
            message: "Must be long or short."
        }, 

        catwayState: {
            type: String,
            trim: true
        }
    }
);

const Catway = mongoose.model('Catway', catwaySchema);
module.exports = Catway;