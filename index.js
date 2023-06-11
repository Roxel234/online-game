import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { fireConfig } from "./fireConfig.js";

const consoleOutputs = [];
let log = console.log;
console.log = function(){
	let dateHours = new Date().getHours().toString();
	let dateMinutes = new Date().getMinutes().toString();
	let dateSeconds = new Date().getSeconds().toString();

	if (dateHours.length == 1) {
		dateHours = "0" + dateHours;
	}
	if (dateMinutes.length == 1) {
		dateMinutes = "0" + dateMinutes;
	}
	if (dateSeconds.length == 1) {
		dateSeconds = "0" + dateSeconds;
	}

	let LOG_PREFIX = dateHours + ':' + dateMinutes + ':' + dateSeconds;
	var args = Array.from(arguments); // ES5
	args.unshift("[ " + LOG_PREFIX + " ] - ");

	let finalOutput = "";
	for (let i = 0; i < args.length; i++) {
		finalOutput += args[i] + " ";
	}
	consoleOutputs.push(finalOutput);
	   
	log.apply(console, args);}
console.log(JSON.stringify(fireConfig));

const fireApp = initializeApp(fireConfig);
const database = getDatabase(fireApp);

function writeData(path,data){
	set(ref(database,path),data);
}

function getData(path,then){
	onValue(ref(database,path),(snap)=>then(snap.val()));
};

import express from "express";
import path from "path";
const app = express();
import { Server } from "socket.io";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname,"public")));

const expressServer = app.listen(8080,"0.0.0.0",()=>{
	console.log("Server started Info:");
	console.log({
		linode: {
			ip: "23.239.4.209",
			port: "80",
			url: "http://23.239.4.209"
		},
		local: {
			ip: "127.0.0.1",
			port: "8080",
			url: "http://127.0.0.1:8080"
		},
		web: {
			ip: "not available",
			port: "80",
			url: "http://dragol.lat"
		}
	});
});

const io = new Server(expressServer);

function createAccount(data){
	let path = "users/"+data.user;
	let info = {password:data.password};

	getData("users",(val)=>console.log(val));

	writeData(path,info);
	console.log("Created user:",data.user);
}

io.on("connection",(socket)=>{
	let address = socket.request.connection._peername;
	console.log(address.address+":"+address.port,"connected");

	socket.on("init-console",()=>{
		let lastLen = 0;
		setInterval(()=>{
			if (lastLen != consoleOutputs.length) {
				socket.emit("console-update",consoleOutputs);
				lastLen = consoleOutputs.length;
			}
		},250);
	});

	socket.on("account-create",(data)=>{
		createAccount(data);
	});
});