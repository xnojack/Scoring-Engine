const telnet = require('telnet-client');
const fs = require('fs');
var crypto = require('crypto');
const checker = require('./serviceChecker.js')
const telnetTester = require('./telnet.js')
const dnsTester = require('./dns.js')
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
app.post('/savetest', (req, res) => {
	let data = req.body
	if(data.expected && data.type == "telnet")
	{
		let services = JSON.parse(fs.readFileSync('services.json', 'utf8'))
		let name = data.name
		delete data.name
		data.params = JSON.parse(data.params)
		data.trim = JSON.parse(data.trim)
		data.urls = data.cmd.split(",")
		data.expected = data.expected.split(",")
		services[name] = data
		fs.writeFile(`services.json`, JSON.stringify(services,null,4).replace(/(\n})(.*\n)*/,"\n}"), err => {
	        if(err){
	            release()
	            throw err;
	        }
	    });
		res.send({"Saved":"Services created"})
	}
	else if(data.expected && data.type == "dns")
	{
		let services = JSON.parse(fs.readFileSync('services.json', 'utf8'))
		let name = data.name
		delete data.name
		data.urls = data.urls.split(",")
		data.expected = data.expected.split(",")
		services[name] = data
		res.send({"Saved":"Services created"})
		fs.writeFile(`services.json`, JSON.stringify(services,null,4).replace(/(\n})(.*\n)*/,"\n}"), err => {
	        if(err){
	            release()
	            throw err;
	        }
	    });
	}
	else if(data.type == "telnet")
		telnetTester(data,res)
	else if(data.type == "dns")
		dnsTester(data,res)
	else
		res.send({"Error":"Not a valid type"})
	//res.redirect('/');
});
app.delete('/delete', (req,res) => {
	let data = req.body
	console.log(data)
	let services = JSON.parse(fs.readFileSync('services.json', 'utf8'))
	let uptime = JSON.parse(fs.readFileSync('uptime.json', 'utf8'))
	let name = data.name
	delete services[name]
	delete uptime[name]
	fs.writeFile(`services.json`, JSON.stringify(services,null,4).replace(/(\n})(.*\n)*/,"\n}"), err => {
        if(err){
            release()
            throw err;
        }
    });
    fs.writeFile(`uptime.json`, JSON.stringify(uptime,null,4).replace(/(\n})(.*\n)*/,"\n}"), err => {
        if(err){
            release()
            throw err;
        }
    });
	res.send({"Deleted":"Services deleted"})
})

app.listen(80, () => console.log('Up on port 80'));