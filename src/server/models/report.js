const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const report = new Schema ({
    ClCon: {type: Number},
    PCon: {type: Number},
    Tempature: {type: Number},
    Depth: {type: Number},
},{
    timestamps: true
});

module.exports = report;