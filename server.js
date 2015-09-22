"use strict";
var express     = require('express'),
    bodyParser  = require('body-parser'),
    morgan      = require("morgan"),
    mongoose    = require("mongoose"),
    config      = require("./config");


var app = express();


mongoose.connect(config.database, function (err) {
    if (err)
        console.log(err);
    else
        console.log("Connected to database.");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(express.static(__dirname + "/public"));

var api = require("./app/routes/api")(app, express);

app.use("/api", api);

app.use("*", function(request, response) {
    response.sendFile(__dirname + "/public/app/index.html");
});


var io = require("socket.io").listen(
    app.listen(config.port, "0.0.0.0", function(err) {
        if (err)
            console.log(err);
        else
            console.log("Listening on port " + config.port);
}));

var usersOnChat = [];

var lastMessages = [];

var insertMessage = function(data) {
    lastMessages.push(data);
    if (lastMessages.length > 15) {
        lastMessages.shift();
    }
}

var deleteUserFromChat = function(username) {
    for (var i = 0; i < usersOnChat.length; i++) {
        if (usersOnChat[i].username === username) {
            usersOnChat.splice(i,1);
            console.log(usersOnChat);
            return;
        } 
    };
}

io.sockets.on('connection', function(client) {
    console.log('Client connected..');

    client.emit("connected",{message:"Connected"});
    client.on("join", function(data) {
        usersOnChat.push(data);
        client.username = data.username;
        client.broadcast.emit("messages", {username: data.username, chat_name: data.chat_name, message: "has been joined."});
        client.broadcast.emit('users', data);
        console.log(usersOnChat);
        for (var i = 0; i < usersOnChat.length; i++) {
            client.emit('users', usersOnChat[i]);
        };

        for (var i = 0; i < lastMessages.length; i++) {
            client.emit('messages', lastMessages[i]);
        };

    });
    
    client.on("messages", function(data) {
        client.broadcast.emit("messages",data);
        insertMessage(data);
        console.log(lastMessages);
    });

    client.on('leave', function(data) {
        console.log("LEAVE");
    });
    client.on('disconnect', function(){
        deleteUserFromChat(client.username);
        client.broadcast.emit("leave", client.username);
    });
});