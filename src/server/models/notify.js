const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notify = new Schema({
    type: {type: String, enum: {values: ["email", "webserver"]}, default: "email"},
    server: {type: String},
    when: {type: String},
});

module.exports = notify;