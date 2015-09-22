"use strict";
var server = io.connect("http://localhost:3000");

server.on("messages", function(data) {
    alert(data.message);
});