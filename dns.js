const dns = require('dns');
var crypto = require('crypto');

module.exports = async function(service,res)
{
	dns.setServers([service.server]);
	let str = [];
	let hash = [];
	let urls = service.urls.split(",")
	function loop(index)
	{
		dns.lookup(urls[index],(err,address,family) => {
			str.push(address)
			hash.push(crypto.createHash('md5').update(address).digest('hex'))
			if(index>=urls.length-1)
			{
				res.send({"str":str,"hash":hash.join(",")})
			}
			else
			{
				loop(++index)
			}
			
		})
	}
	loop(0)
}