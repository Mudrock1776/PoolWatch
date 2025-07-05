const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const report = require("./report");
const notify = require("./notify");

const device = new Schema({
    serialNumber: {type: Number, min: 0, required: true},
    battery: {type: Number, min: 0, required: true},
    connected: {type: Boolean, required: true},
    pumpStatus: {type: Boolean, required: true},
    fiveRegulator: {type: Boolean, required: true},
    twelveRegulator: {type: Boolean, required: true},
    sampleRate: {type: Number, min: 0, required: true},
    updateServers: {type: [notify]},
    reports: {type: [report]},
});

module.exports = mongoose.model("device", device);