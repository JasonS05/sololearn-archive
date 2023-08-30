// this is a server I made in the iOS Alpine Linux emulator iSH using vim

const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

const serverPath = "/root/JS/server"; // here you can see a little bit of my directory structure (/root seems to be default home directory on Alpine, at least in iSH anyway). I store all my JS stuff in ~/JS, all my golang stuff in ~/golang, etc. Since the server is a JS thing, I put the server directory (which I've set up as root directory of the server) in my JS directory

const errorFiles = {
	400: "/400.html",
	404: "/404.html",
	500: "/500.html"
};

const ext2contentType = {
	".html": "text/html",
	".css": "text/css",
	".js": "text/js"
};

let requests = 0;
http.createServer((req, res) => {
	const thisRequest = requests++;
	console.log(`New request #${thisRequest}: "${req.url}"`);
	
	const file = url.parse(req.url, true).pathname === "/"? "/index.html" : url.parse(req.url, true).pathname;
	
	if (file.indexOf("/../") !== -1) {
		res.writeHead(400, {"Content-Type": "text/html"});
		response.end(fs.readFileSync(serverPath + errorFiles[400]));
		console.log(`Responded to request #${thisRequest} with: "${errorFiles[400]}"`);
	} else if (fs.existsSync(serverPath + file)) {
		fs.readFile(serverPath + file, (err, data) => {
			if (err) {
				res.writeHead(500, {"Content-Type": "text/html"});
				res.end(fs.readFileSync(serverPath + errorFiles[500]));
				console.log(`Responded to request #${thisRequest} with: "${errorFile[500]}"`);
			} else {
				res.writeHead(200, {"Content-Type": ext2contentType[path.extname(file)] || "text/plain"});
				res.end(data);
				console.log(`Responded to request #${thisRequest} with: "${file}"`);
			}
		});
	} else {
		res.writeHead(404, {"Content-Type": "text/html"});
		res.end(fs.readFileSync(serverPath + errorFiles[404]));
		console.log(`Responded to request #${thisRequest} with: "${errorFiles[404]}"`);
	}
}).listen(80);

console.log(`Listening on port 80`);

