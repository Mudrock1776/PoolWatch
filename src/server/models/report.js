const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const report = new Schema ({
    ClCon: {type: Number},
    PCon: {type: Number},
    tempature: {type: Number},
    particulateAmount: {type: Number},
    particulateSize: {type: Number}
},{
    timestamps: true
});

module.exports = report;