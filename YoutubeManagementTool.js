var https = require('https');
var express = require('express');
fs = require('fs');

var options = {
	key: fs.readFileSync('certification/key.pem'),
	cert: fs.readFileSync('certification/cert.pem')
};
var httpsPort = 3000;


var app = express();
app.use(express.static('public'));

https.createServer(options, app).listen(httpsPort, function(){
	console.log("Https server listening on port " + httpsPort);
});
