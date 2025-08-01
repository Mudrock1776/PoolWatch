const express = require("express");

const Routes = express.Router();
const device = require("../controllers/device");

//Device Routes
//Exists
/* Takes in:
{
    serialNumber: <serial number>
}
On success returns 200:
{
    answer: true
} if device exists
{
    answer: false
} if device does not exists */
Routes.route("/device/exists").post((req,res) => {
    device.deviceExists(req,res);
});

//Create Device
/*Takes in:
{
    serialNumber: <serial number>,
    battery: <batter charge>,
    pumpStatus: <pump status>,
    fiveRegulator: <five volt regulator status>,
    twelveRegulator: <twelve volt regulator status>,
    sampleRate: <current sample rate>
}
on success returns 200:
{
    update: false
}
*/
Routes.route("/device/create").post((req,res) =>{
    device.createDevice(req,res);
});

//Add Report
/* Takes in:
{
    serialNumber: <serial number>,
    report: {
        tempature: <tempature>,
        ClCon: <Chlorine Concentration>,
        PCon: <Phosphoric acid concentration>,
        particulateAmount: <amount of particulates>,
        particulateSize: <size of particulates>
    }
}
on success returns 200:
{
    update: false
}*/
Routes.route("/report/add").post((req,res) => {
    device.addReport(req,res);
});

//status Update
/* Takes in:
{
    serialNumber: <serial number>,
    battery: <battery charge>,
    pumpStatus: <pump status>,
    fiveRegulator: <five volt regulator status>,
    twelveRegulator: <twelve volt regulator status>,
    sampleRate: <current sample rate>
}
on success returns 200:
{
    needUpdate: <update status>
    sampleRate: <sample rate>,
    testChlorine: <boolean>,
    testPhosphate: <boolean>,
    testTempature: <boolean>,
    testParticulate: <boolean>,
}*/
Routes.route("/status/update").post((req,res) => {
    device.statusUpdate(req,res);
})

module.exports = Routes;