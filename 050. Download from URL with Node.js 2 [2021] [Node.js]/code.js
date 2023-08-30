async function download(location) {
    return new Promise((resolve, reject) => {
        require(new URL(location).protocol.replace(":", "")).get(location, response => {
            let buff = Buffer.from([]);
            response.on("data", chunk => buff = Buffer.concat([buff, chunk]));
            response.on("end", () => resolve(buff.toString()));
        });
    });
}

download("https://www.example.com/").then(data => console.log(data));

