const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

if (process.env.WEB_PORT == null){
    process.env.WEB_PORT = 8080;
}

if (process.env.DISCONNECT_TIMEOUT == null){
    process.env.DISCONNECT_TIMEOUT = 60000;
} else {
    process.env.DISCONNECT_TIMEOUT = Number(process.env.DISCONNECT_TIMEOUT);
}

if (process.env.SAMPLE_CHECK == null){
    process.env.SAMPLE_CHECK = 60000;
} else {
    process.env.SAMPLE_CHECK = Number(process.env.SAMPLE_CHECK);
}

const Db = require("./DBconn");

app.use(cors());

app.use(express.json());

//Routes
app.use(require("./routes/device"));
app.use(require("./routes/website"));

app.use(express.static(path.resolve(__dirname, "../client/out")));

app.get('/{*path}', (req,res) => {
    res.sendFile(path.resolve(__dirname, "../client/out", "index.html"));
});

app.listen(process.env.WEB_PORT, async () => {
    console.log(`Server is running on port: ${process.env.WEB_PORT}`);
    console.log(`Connected to Database ${process.env.MONGOURL}`)
});
