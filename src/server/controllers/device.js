const device = require("../models/account");
const report = require("../models/report");
const mongoose = require("mongoose");

//Devices
//Exist
exports.deviceExists = async (req,res) => {
    try {
        if (await device.exists({serialNumber: req.body.serialNumber})){
            res.status(200).send({
                answer: true
            })
        } else {
            res.status(200).send({
                answer: false
            })
        }
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Create Device
exports.createDevice = async (req, res) => {
    try {
        var newDevice = new device({
            serialNumber: req.body.serialNumber,
            battery: req.body.battery,
            connected: true,
            pumpStatus: req.body.pumpStatus,
            fiveRegulator: req.body.fiveRegulator,
            twelveRegulator: req.body.twelveRegulator,
            sampleRate: req.body.sampleRate,
            updateServers: [],
            reports: [],
        });
        await newDevice.save();
        res.status(200).send({
            update: false
        });
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Add Report
exports.addReport = async (req, res) => {
    try {
        newReport = new report(req.body.report);
        searchedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        searchedDevice.reports.push(newReport);
        await device.findByIdAndUpdate(searchedDevice._id, searchedDevice);
        res.status().send({
            update: false
        });
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//status Update
exports.statusUpdate = async (req, res) => {
    try {
        await device.findOneAndUpdate({serialNumber: req.serialNumber},{
            battery: req.body.battery,
            connected: true,
            pumpStatus: req.body.pumpStatus,
            fiveRegulator: req.body.fiveRegulator,
            twelveRegulator: req.body.twelveRegulator,
        });
        res.status().send({
            update: false
        });
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}