var mongoose = require("mongoose");

//mongo connection options
mongoose.connect(
  "mongodb://gauravroy:gaurav1995@ds115434.mlab.com:15434/rice",
  { useNewUrlParser: true }
);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Connection succeeded.");
});
