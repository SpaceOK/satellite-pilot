var fs = require("fs");
var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());
app.use(function(req, res, next) {
  if (/.*\.js/.test(req.path)) {
    res.charset = "utf-8";
    res.header("Content-Type", "application/json; charset=utf-8");
  }
  next();
});
app.use(express.static(__dirname + '/www'));

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

console.log('Express server started - port: ' + port);