const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const app = express();


app.use(express.static('static'));

const dev = app.get('env') !== 'production';

if(!dev){
	app.disable('x-powered-by');
	app.use(compression());
	app.use(morgan('common'));

	app.use(express.static(path.resolve(__dirname, 'build')));
	app.get('*', function (req, res, next) {
    	res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
	});

}

if(dev){
	app.use(morgan('dev'));
}

const https = require('https');
const PORT = 3000;

var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};

https.createServer(config, app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTPS server on https://localhost:%s", PORT);
});