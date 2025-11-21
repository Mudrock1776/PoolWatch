const account = require("../models/account");
const device = require("../models/device");
const mongoose = require("mongoose");

//acounts
//Create account
exports.createAccount = async (req,res) => {
    var newAccount = new account({
        username: req.body.username,
        password: req.body.password,
        devices: []
    });
    if (await account.exists({username: newAccount.username})){
        res.status(403).send({
            token: "Username Taken"
        });
    } else {
        try {
            await newAccount.save();
            savedAccount = await account.findOne({username:newAccount.username});
            res.status(200).send({
                token: savedAccount._id
            });
        } catch(err){
            console.log(err);
            res.status(400).send(err);
        }
    }
}

//Login
exports.login = async (req, res) => {
    try {
        var id = await account.exists({username: req.body.username, password: req.body.password});
        if (id != null){
            res.status(200).send({
                token: id._id
            });
        } else {
            res.status(401).send({
                token: "Invalid Credntials"
            });
        }
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Add Device
exports.addDevice = async (req, res) => {
    try {
        oldAccount = await account.findById(req.body.id);
        if (oldAccount.devices.includes(req.body.serialNumber)) {
            res.status(403).send({
                err: "Device already added"
            });
        } else if (!(await device.exists({serialNumber:req.body.serialNumber}))){
            res.status(404).send({
                err: "Device does not exists"
            })
        } else {
            oldAccount.devices.push(req.body.serialNumber);
            await account.findByIdAndUpdate(req.body.id, oldAccount);
            res.status(200).send();
        }
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Remove Device
exports.removeDevice = async (req, res) => {
    try {
        var oldAccount = await account.findById(req.body.id)
        if (oldAccount.devices.includes(req.body.serialNumber)) {
            oldAccount.devices = oldAccount.devices.filter(item => {
                if (item != req.body.serialNumber){
                    return item
                }
            });
            await account.findByIdAndUpdate(req.body.id, oldAccount);
            res.status(200).send();
        } else { //This proably isn't needed
            res.status(403).send({
                err: "Device not in array"
            });
        }
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Devices
//List Devices
exports.listDevices = async (req, res) => {
    try{
        userAccount = await account.findById(req.body.id);
        const now = new Date();
        let deviceList = [];
        for (let i=0; i<userAccount.devices.length; i++){
            pulledDevice = await device.findOne({serialNumber: userAccount.devices[i]});
            if (now.getTime() - pulledDevice.lastUpdate > process.env.DISCONNECT_TIMEOUT){
                pulledDevice.connected = false;
                device.findByIdAndUpdate(pulledDevice._id, pulledDevice);
            }
            deviceList.push(pulledDevice);
        }
        await res.status(200).send(deviceList);
    } catch(err){
        console.log(err);
        await res.status(400).send(err);
    }
}

//fetch Device
exports.fetchDevice = async (req, res) => {
    try{
        const now = new Date();
        searchedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        if (now.getTime() - searchedDevice.lastUpdate > process.env.DISCONNECT_TIMEOUT){
            searchedDevice.connected = false;
            device.findByIdAndUpdate(searchedDevice._id, pulledDevice);
        }
        res.status(200).send(searchedDevice);
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Delete Report
exports.deleteReport = async (req, res) => {
    try{
        searchedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        searchedDevice.reports.splice(req.body.index,1);
        await device.findByIdAndUpdate(searchedDevice._id, searchedDevice);
        res.status(200).send(searchedDevice);
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Request Test
exports.requestTest = async (req, res) => {
    try {
        searchedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        if (req.body.testChlorine){
            searchedDevice.testChlorine = true;
        }
        if (req.body.testPhosphate){
            searchedDevice.testPhosphate = true;
        }
        if (req.body.testTempature){
            searchedDevice.testTempature = true;
        }
        if (req.body.testParticulate){
            searchedDevice.testParticulate = true;
        }
        if (req.body.fillWater){
            searchedDevice.fillWater = true;
        }
        searchedDevice.needUpdate = true;
        await device.findByIdAndUpdate(searchedDevice._id, searchedDevice);
        res.status(200).send();
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Update SampleRate
exports.updateRate = async (req, res) => {
    try {
        searchedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        searchedDevice.sampleRate = req.body.sampleRate;
        searchedDevice.needUpdate = true;
        await device.findByIdAndUpdate(searchedDevice._id, searchedDevice);
        res.status(200).send();
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Add Update Request
exports.addUpdateServer = async (req, res) =>{
    try {
        searchedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        var newUpdateServer = req.body.updateServer;
        searchedDevice.updateServers.push(newUpdateServer);
        await device.findByIdAndUpdate(searchedDevice._id, searchedDevice);
        res.status(200).send();
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//Remove Update Request
exports.removeUpdateServer = async (req, res) =>{
    try {
        searchedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        searchedDevice.updateServers.splice(req.body.index, 1);
        await device.findByIdAndUpdate(searchedDevice._id, searchedDevice);
        res.status(200).send(searchedDevice);
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

async function checkSample(){
    let deviceList = await device.find({});
    const now = new Date();
    deviceList.forEach(async deviceItem => {
        let currTime = now.getTime();
        let hours = currTime - deviceItem.lastSample;
        
        hours = hours / 3600000;
        if (hours >= deviceItem.sampleRate) {
            deviceItem.testChlorine = true;
            deviceItem.testPhosphate = true;
            deviceItem.testTempature = true;
            deviceItem.testParticulate = true;
            deviceItem.needUpdate = true;
            deviceItem.lastSample = currTime;
            await device.findByIdAndUpdate(deviceItem._id, deviceItem);
        }
        
    });
}

setInterval(checkSample, process.env.SAMPLE_CHECK); 