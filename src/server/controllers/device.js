const device = require("../models/device");
const report = require("../models/report");
const updateServer = require("../models/notify");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: process.env.EMAILSERVICE,
    auth: {
        user: process.env.EMAILUSERNAME,
        pass: process.env.EMAILPASSWORD
    }
});

function sendEmial(to, subj, msg){
    const mailOptions = {
        from: process.env.EMAILUSERNAME,
        to: to,
        subject: subj,
        text: msg
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error){
            console.log(error);
        }
    });
}

function sendHTTP(to, msg){
    try {
        fetch(to, {
            method: "POST",
            headers: {
                'Content-Type': 'text/plain'
            },
            body: msg
        })
    } catch(err){
        console.log(err)
    }
}

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
            needUpdate: false, //should be false
            sampleRate: req.body.sampleRate,
            testChlorine: false,
            testPhosphate: false,
            testTempature: false,
            testParticulate: false,
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
        for (let i=0; i<searchedDevice.updateServers.length; i++){
            const updateRequest = searchedDevice.updateServers[i];
            const logic = updateRequest.when.replace(/ /g, "");
            let variable = "";
            let n = 0
            try {
                while (true){
                    if (logic[n] == '<' || logic[n] == '>' || logic[n] == '='){
                        break
                    }
                    variable = variable + logic[n];
                    n = n+1;
                }
            } catch (err) {
                console.log(err);
            }
            let sign = logic[n]
            n = n+1;
            if (logic[n] == '<' || logic[n] == '>' || logic[n] == '=') {
                sign = sign + logic[n];
                n = n+1;
            }
            let threshold = "";
            while(n < logic.length){
                threshold = threshold + logic[n];
                n = n+1;
            }
            let value;
            switch (variable){
                case "TEMP":
                    value = newReport.tempature;
                    threshold = Number(threshold);
                    if (value < 0){
                        return;
                    }
                    break;
                case "CLCON":
                    value = newReport.ClCon;
                    threshold = Number(threshold);
                    if (value < 0){
                        return;
                    }
                    break;
                case "PCON":
                    value = newReport.PCon;
                    threshold = Number(threshold);
                    if (value < 0){
                        return;
                    }
                    break;
                case "PARTA":
                    value = newReport.particulateAmount;
                    threshold = Number(threshold);
                    if (value < 0){
                        return;
                    }
                    break;
                case "PARTS":
                    value = newReport.particulateSize;
                    if (value < 0){
                        return;
                    }
                    break;
                default:
                    return;
            }
            let condition = false;
            switch(sign){
                case "=":
                    condition = (value == threshold);
                    break;
                case "<":
                    condition = (value < threshold);
                    break;
                case ">":
                    condition = (value > threshold);
                    break;
                case "<=":
                    condition = (value <= threshold);
                    break;
                case ">=":
                    condition = (value >= threshold);
                    break;
            }
            if (condition){
                switch(updateRequest.type){
                    case "email":
                        sendEmial(updateRequest.server, "Condition Succeded", logic);
                        break;
                    case "webserver":
                        sendHTTP(updateRequest.server, logic);
                        break;
                }
            }
        }
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}

//status Update
exports.statusUpdate = async (req, res) => {
    try {
        const modifiedDevice = await device.findOne({serialNumber: req.body.serialNumber});
        res.status(200).send({
            needUpdate: modifiedDevice.needUpdate,
            sampleRate: modifiedDevice.sampleRate,
            testChlorine: modifiedDevice.testChlorine,
            testPhosphate: modifiedDevice.testPhosphate,
            testTempature: modifiedDevice.testTempature,
            testParticulate: modifiedDevice.testParticulate,
        });
        await device.findOneAndUpdate({serialNumber: req.body.serialNumber},{
            battery: req.body.battery,
            connected: true,
            pumpStatus: req.body.pumpStatus,
            fiveRegulator: req.body.fiveRegulator,
            twelveRegulator: req.body.twelveRegulator,
            needUpdate: false,
            testChlorine: false,
            testPhosphate: false,
            testTempature: false,
            testParticulate: false,
        });
    } catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}