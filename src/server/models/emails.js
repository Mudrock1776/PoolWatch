const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emails = new Schema({
    to: {type: String},
    subject: {type: String},
    text: {type: String}
});

module.exports = mongoose.model("emails", emails);