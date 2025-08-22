const express = require("express");

const Routes = express.Router();
const website = require("../controllers/website");

//Website Routes
//Create Account
/* Takes in:
{
    username: <new username>,
    password: <new password>
}
on success returns 200:
{
    token: userID
}
on failure returns 403:
{
    token: "Username Taken"
}*/
Routes.route("/account/create").post((req,res) =>{
    website.createAccount(req,res);
});

//Login
/* Takes in:
{
    username: <new username>,
    password: <new password>
}
on success returns 200:
{
    token: userID
}
on failure returns 401:
{
    token: "Invalid Credntials"
}*/
Routes.route("/account/login").post((req,res) =>{
    website.login(req,res);
});

//Add Device
/* Takes in:
{
    id: <userID>,
    serialNumber: <serial number>
}
on success returns 200
on failure returns 403:
{
    err: "Device already added"
}*/
Routes.route("/device/add").post((req,res) => {
    website.addDevice(req,res);
});

//Remove Device
/* Takes in:
{
    id: <userID>,
    serialNumber: <serial number>
}
on success returns 200
on failure returns 403:
{
    err: "Device not in array"
}*/
Routes.route("/device/remove").post((req,res) => {
    website.removeDevice(req, res);
});

//List Devices
/* Takes in:
{
    id: <userID>
}
on success returns 200:
[Device list]*/
Routes.route("/device/list").post((req,res)=>{
    website.listDevices(req,res);
});

//Fetch Device
/* Takes in:
{
    serialNumber: <serial number>
}
on success returns 200: Device */
Routes.route("/device/fetch").post((req,res)=>{
    website.fetchDevice(req,res);
});

//Delete Report
/* Takes in:
{
    serialNumber: <serial number>,
    index: <repot index>
}
on success returns 200: Device */
Routes.route("/report/delete").post((req,res)=>{
    website.deleteReport(req,res);
});

//Request Tests
/* Takes in:
    serialNumber: <serial number>,
    testChlorine: <boolean>,
    testPhosphate: <boolean>,
    testTempature: <boolean>,
    testParticulate: <boolean>,
on success returns 200 */
Routes.route("/test/request").post((req, res) => {
    website.requestTest(req, res);
});

//Update Server Add
/* Takes in:
    serialNumber: <serial number>,
    updateServer: {
        type: <email or webserver>,
        server: <location of server>,
        when: <logic of when to update>
    }
on success returns 200 */
Routes.route("/notify/add").post((req, res) => {
    website.addUpdateServer(req,res);
});

//Update Server removal
/* Takes in:
    serialNumber: <serial number>,
    index: <index of entry>
on success returns 200 */
Routes.route("/notify/remove").post((req, res) => {
    website.removeUpdateServer(req,res);
});

module.exports = Routes;