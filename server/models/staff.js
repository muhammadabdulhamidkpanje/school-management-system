const mongoose = require('mongoose')


const staffShema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
    },
    phone:{
        type: String,
        required: true,
        trim: true,
    },
    address:{
        type: String,
        required: true,
        trim: true,
    },
    position:{
        type: String,
        required: false,
        trim: true,
    },
    salary:{
        type: Number,
        required: false,
        trim: true,
    },
    dateOfJoining:{
        type: Date,
        required: true,
        default: Date.now,
    },
    

})

module.exports = mongoose.model('Staff', staffShema)