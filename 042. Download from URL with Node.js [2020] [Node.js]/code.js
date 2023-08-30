// These two download functions return a buffer. To access the contents as a
// string I concatenate an empty string to the beginning using the + operator

async function download(URL) {
	return new Promise((resolve, reject) => {
		require("https").get(URL, response => {
			let buff = Buffer.from([]);
			
			response.on("data", chunk => buff = Buffer.concat([buff, chunk]));
			response.on("end", () => resolve(buff));
		});
	});
}

download("https://www.example.com/").then(data => console.log("" + data));


// here is a version using a callback if you're more comfortable with that
/*
function download(URL, callback) {
	require("https").get(URL, response => {
		let buff = Buffer.from([]);
		
		response.on("data", chunk => buff = Buffer.concat([buff, chunk]));
		response.on("end", () => callback(buff));
	});
}

download("https://www.example.com/", data => console.log("" + data));
*/

