const device = require("../models/device");
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
            needUpdate: true, //should be false
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
        const newReport = req.body.report;
        const now = new Date();
        newReport.testTaken = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()} - ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
        searchedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        searchedDevice.reports.unshift(newReport);
        await device.findByIdAndUpdate(searchedDevice._id, searchedDevice);
        res.status(200).send({
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
        await device.findOneAndUpdate({serialNumber: req.body.serialNumber},{
            battery: req.body.battery,
            connected: true,
            pumpStatus: req.body.pumpStatus,
            fiveRegulator: req.body.fiveRegulator,
            twelveRegulator: req.body.twelveRegulator,
        });
        const modifiedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        res.status(200).send({
            needUpdate: modifiedDevice.needUpdate,
            sampleRate: modifiedDevice.sampleRate,
        });
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}