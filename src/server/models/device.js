const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const report = require("./report");
const notify = require("./notify");

const device = new Schema({
    serialNumber: {type: Number, min: 0, required: true, unique:true},
    battery: {type: Number, min: 0,default:null},
    connected: {type: Boolean, default:false},
    pumpStatus: {type: Boolean, default:false},
    fiveRegulator: {type: Boolean, default:null},
    twelveRegulator: {type: Boolean, default:null},
    needUpdate: {type: Boolean, default:false},
    sampleRate: {type: Number, min: 0,default:24},
    testChlorine: {type: Boolean, default:false},
    testPhosphate: {type: Boolean, default:false},
    testTempature: {type: Boolean, default:false},
    testParticulate: {type: Boolean, default:false},
    updateServers: {type: [notify],default: []},
    reports: {type: [report],default: []},
});

module.exports = mongoose.model("device", device);
