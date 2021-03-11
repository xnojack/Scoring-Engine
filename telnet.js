const telnet = require('telnet-client');
var crypto = require('crypto');

module.exports = async function(service,res)
{
	let params = JSON.parse(service.params)
	let trim = JSON.parse(service.trim)
	params.negotiationMandatory = false
	let cmds = service.cmd.split(",")
	let str = []
	let hash = []
	function loop(index)
	{
		let connection = new telnet();
		let cmd = cmds[index].replace(/\\n/g,"\n").replace(/\\r/g,"\r")
		
		// connect to server
		connection.connect(params)
		.then(prompt => {
			connection.send(cmd)
			.then(response => {
				let strTemp = trim[0]
					+response.split(trim[0])[1].split(trim[1])[0]
					+trim[1]
				connection.end()
				str.push(strTemp)
				hash.push(crypto.createHash('md5').update(strTemp).digest('hex'))
				if(index>=cmds.length-1)
				{
					res.send({"str":str,"hash":hash.join(",")})
				}
				else
				{
					loop(++index)
				}
			})
			.catch(function(error){
				console.error(error)
			})
		}, function(error) {
			console.log('promises reject:', error)
		})
		.catch(function(error) {
			console.error(error)

		})
	}
	loop(0)
}