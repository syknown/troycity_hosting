/* eslint-disable linebreak-style */
const mongoose = require("mongoose");
let dburl = process.env.uat_db_rl;
var gracefullshutdown;

mongoose.connect(dburl);

mongoose.set("strictQuery", false);
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose connection events here
mongoose.connection.on("connected", () => {
  //console.log("Database connected successfully at %s", dburl);
});
mongoose.connection.on("error", (err) => {
  //console.log("Database connection failed with err %s", err);
});
mongoose.connection.on("disconnected", () => {
  //console.log("Mongoose connection closed");
});

//capture app termination/restart events
gracefullshutdown = function (msg, callback) {
  mongoose.connection.close(() => {
    //console.log("Mongoose partners disconnected through" + msg);
    callback();
  });
};

//For nodemon restarts
process.once("SIGUSR2", function () {
  gracefullshutdown("nodemon restart", function () {
    process.kill(process.pid, "SIGUSR2");
  });
});

//for app termination
process.on("SIGINT", function () {
  gracefullshutdown("app termination", function () {
    process.exit(0);
  });
});