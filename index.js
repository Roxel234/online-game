import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyDS8vN-wwgm9c50ZIGlluVhNrZC0LxcbZk",
  authDomain: "nodejs-proyect-1.firebaseapp.com",
  projectId: "nodejs-proyect-1",
  storageBucket: "nodejs-proyect-1.appspot.com",
  messagingSenderId: "150063946661",
  appId: "1:150063946661:web:5a98375a82b52d3f30e64c",
  databaseURL: "https://nodejs-proyect-1-default-rtdb.firebaseio.com",
};
const fireApp = initializeApp(firebaseConfig);
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname,"public")));

const expressServer = app.listen(8080,"0.0.0.0",()=>{
	console.log("Listening on port 2020");
});

const io = new Server(expressServer);

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
});