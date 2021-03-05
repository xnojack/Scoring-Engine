const telnet = require('telnet-client');
const fs = require('fs');
var crypto = require('crypto');
const checker = require('./serviceChecker.js')
const telnetTester = require('./telnet.js')
const express = require('express')
const app = express();
app.use(express.static('frontend'));
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, cookie, session");
  next();
});

const services = JSON.parse(fs.readFileSync('services.json', 'utf8'));

setInterval(function(){
	checker()
},10000)

app.get('/', (req, res) => {
    res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/uptime', (req, res) => {
    res.send(JSON.parse(fs.readFileSync('uptime.json', 'utf8')));
});
app.get('/config', (req, res) => {
    res.send(JSON.parse(fs.readFileSync('services.json', 'utf8')));
});
app.post('/config', (req, res) => {
	let data = req.body
	console.log(data)
	res.redirect('/');
});
app.post('/test', (req, res) => {
	let data = req.body
	telnetTester(data,res)
	res.redirect('/');
});

app.listen(80, () => console.log('Up on port 80'));