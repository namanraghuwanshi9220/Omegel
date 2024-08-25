const express = require('express')
const app = express()

const indexRouter = require("./routes/index");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const io = socketIO(server);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

let waitingusers = [];
let rooms = {};


io.on("connection", function (socket){
    
    socket.on("joinroom", function(){
      if(waitingusers.length > 0) {

        let partner = waitingusers.shift();
        const roomname = `${socket.id}-${partner.id}`;
        
        socket.join(roomname);
        partner.join(roomname);

        io.to(roomname).emit("joined");
      } else {
        waitingusers.push(socket);
      }

    });

    socket.on("diconnect", function (){
        let index = waitingusers.findIndex(waitingUser => waitingUser.id === socket.id);
     
        waitingusers.splice(index, 1);
     });
});



server.listen(process.env.PORT || 3000 , console.log("server listen on 3000"));