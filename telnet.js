const telnet = require('telnet-client');
var crypto = require('crypto');

module.exports = async function(service,res)
{
	let connection = new telnet();

	let cmd = service.cmd
	let params = JSON.parse(service.params)
	params.negotiationMandatory = false

	// connect to server
	connection.connect(params)
	.then(prompt => {
		connection.send(cmd)
		.then(response => {
			let str = service.trim[0]
				+response.split(service.trim[0])[1].split(service.trim[1])[0]
				+service.trim[1]
			connection.end()
			res.send({"str":str,"hash":crypto.createHash('md5').update(str).digest('hex')})
		})
	}, function(error) {
		console.log('promises reject:', error)
	})
	.catch(function(error) {
		// handle the throw (timeout)
	})
}