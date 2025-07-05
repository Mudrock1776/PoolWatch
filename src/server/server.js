const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

if (process.env.WEB_PORT == null){
    process.env.WEB_PORT = 8080;
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

app.listen(process.env.WEB_PORT, () => {
    console.log(`Server is running on port: ${process.env.WEB_PORT}`);
    console.log(`Connected to Database ${process.env.MONGOURL}`)
});
