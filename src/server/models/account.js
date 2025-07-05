const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const account = new Schema ({
    username: {type: String, required: true},
    password: {type: String, required: true},
    devices: {type: [Number], min: 0},
});

module.exports = mongoose.model('account', account);