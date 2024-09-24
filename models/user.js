const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Le nom est requis']
    },
    email: {
        type: String,
        trim: true,
        require: [true, "L'email est requis"],
        unique: true, 
        lowercase: true
    },
    password: {
        type: String,
        trim: true
    }
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = bcrypt.hashSync(this.password, 10);

    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;