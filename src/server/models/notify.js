const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notify = new Schema({
    type: {type: String},
    server: {type: String},
    when: {type: String},
});

module.exports = notify;