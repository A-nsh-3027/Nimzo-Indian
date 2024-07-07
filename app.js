//backend




const express = require("express");
const socket = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");
const path = require("path")
const app = express(); //instance creation
const server = http.createServer(app);
const io = socket(server); //7-8 instantiate socketio
 // http server and express server are different but connected
 //socket helps in real time connection while playing chess

 const chess = new Chess();
 //chess rules are initialised now

 let players = {};
 let currentPlayer = "w";

 app.set("view engine","ejs"); //to view
 app.use(express.static('public'));

 app.get("/" , (req, res) => {
    res.render("index", {title: "chess Game"});
 });

 //socket io is used on both frontend and backend as well to estalish the connection



 io.on("connection", function(uniquesocket){
    console.log("connected");
 

 if(!players.white){
    players.white=uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
 }
 else if(!players.black){
    players.black=uniquesocket.id;
    uniquesocket.emit("playerRole", "b")
 }
 else{
   uniquesocket.emit("spectatorRole")
 }

 uniquesocket.on("disconnet", function(){
   if(uniquesocket.id==players.white){
      delete players.white;
   }
   else if(uniquesocket.id==players.black){
      delete players.black;
   }
   
 });


uniquesocket.on("move", (move)=>{
   try{
      if(chess.turn()=='w' && uniquesocket.id!==players.white) return;
      if(chess.turn()=='b' && uniquesocket.id!==players.black) return;
      //making sure that right player moves
      //now update game state
     const result =  chess.move(move);//if we donot use try catch then wrong move would result in  crashing the server
     if(result){
      currentPlayer=chess.turn();
      io.emit("move", move); //send move to frontend, update to frontend part
      io.emit("boardState", chess.fen());
     }
     else{
      console.log("Invalid Move : ", move);
      uniquesocket.emit("invalidMove", move); //let the player know that he is doing wrong
     }
   }
   catch(err){
      console.log(err);
      uniquesocket.emit("Invalid move : ", move);
   }
});
 });

 server.listen(3000, function() {
    console.log("listening on port 3000");
 })

