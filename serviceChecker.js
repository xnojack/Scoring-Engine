const telnet = require('telnet-client');
const fs = require('fs');
var crypto = require('crypto');
const dns = require('dns');

function checkResult(service,str,i)
{
	let hash = crypto.createHash('md5').update(str).digest('hex');
	if(!uptime[service]) uptime[service] = {score:0}
	let expected
	if(typeof i !== 'undefined')
	{
		expected = services[service].expected[i]
		uptime[service].lastChecked = i
	}
	else
	{
		expected = services[service].expected
	}

	if(hash == expected)
	{
		uptime[service].isUp = true
		uptime[service].score+=1
	}
	else
	{
		uptime[service].isUp = false
		uptime[service].score-=1
	}
	fs.writeFile(`uptime.json`, JSON.stringify(uptime,null,4).replace(/(\n})(.*\n)*/,"\n}"), err => {
        if(err){
            release()
            throw err;
        }
    });
}

module.exports = async function()
{
	uptime = JSON.parse(fs.readFileSync('uptime.json', 'utf8'));
	services = JSON.parse(fs.readFileSync('services.json', 'utf8'));
	for(let service in services)
	{
		if(services[service].type == "telnet")
		{
			let connection = new telnet();

			let params = services[service].params
			params.negotiationMandatory = false
			let lastChecked = uptime[service] && uptime[service].lastChecked>-1?uptime[service].lastChecked:-1
			let i = lastChecked+1<services[service].cmd.length?lastChecked+1:0
			let cmd = services[service].cmd[i]

			// connect to server
			connection.connect(params)
			.then(prompt => {
				connection.send(cmd)
				.then(response => {
					let str = services[service].trim[0]
						+response.split(services[service].trim[0])[1].split(services[service].trim[1])[0]
						+services[service].trim[1]
					connection.end()
					checkResult(service,str,i)
				})
			}, function(error) {
				console.log('promises reject:', error)
			})
			.catch(function(error) {
				// handle the throw (timeout)
			})
		}
		else if(services[service].type == "dns")
		{
			dns.setServers([services[service].server]);
			let lastChecked = uptime[service] && uptime[service].lastChecked>-1?uptime[service].lastChecked:-1
			let i = lastChecked+1<services[service].urls.length?lastChecked+1:0
			dns.lookup(services[service].urls[i],(err,address,family) => {
				checkResult(service,address,i)
			})
		}
	}
}