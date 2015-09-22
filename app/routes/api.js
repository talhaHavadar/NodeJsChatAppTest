"use strict";
var config          = require("../../config"),
    jsonwebtoken    = require("jsonwebtoken"),
    mongoose        = require("mongoose"),
    User            = require("../models/user"),
    secretKey       = config.secretKey;

function createToken(user) {
    var token = jsonwebtoken.sign({
        _id: user._id,
        name: user.name,
        username: user.username,
        chat_name: user.chat_name
    }, secretKey, {
        expiresInMinute: 1440
    });
    
    return token;
}

module.exports = function(app, express) {
    var api = express.Router();
    
    api.post("/signup", function(request, response) {
        var user = new User({
            name: request.body.name,
            chat_name: request.body.chat_name,
            username: request.body.username,
            password: request.body.password
        });
        user.save(function(err) {
            if (err) {
                console.log(err);
                if (err.code == 11000) { //Duplicate key err 
                    var field = err.message.split('index: chatapptest.')[1].split('.$')[1];
                    // now we have `username_1 dup key`
                    field = field.split(' dup key')[0]
                    field = field.substring(0, field.lastIndexOf('_')) // returns username
                    var data = {
                        success: false,
                        message: field+" field already in our database please choose different value."
                    };
                    response.json(data);
                    return;
                }
                
                var data = {
                    success: false,
                    message: "Something went wrong..."
                };
                response.json(data);
                return;
            }
            
            response.json({success: true, message:"User has been created."});
        });
        
    });
    
    api.get("/users", function(request, response) {
        User.find({}, function(err, users) {
            if (err) {
                response.json({success: false, message: err});
                return;
            } else {
                response.json(users);
            }
        });
    });

    api.post("/login", function (request, response) {
        User.findOne({
            username: request.body.username
        }).select("username chat_name password name").exec(function(err, user) {
            if (err) {
                console.log(err);
                response.json({ success: false, message: err });
                return;
            }
            if (!user) {
                response.json({ success: false, message: "User does not exist." });
            } else {
                var validPassword = user.comparePassword(request.body.password);
                if (!validPassword) {
                    response.json({
                        success: false,
                        message: "Invalid password."
                    });
                    return;

                } else {
                    var token = createToken(user);
                    response.json({
                        success: true,
                        message: "User successfully logged in.",
                        token: token
                    });
                }

            }
        });
    });
    
    // MIDDLEWARE

    api.use(function(request, response, next) {
        var token = request.body.token || request.params.token || request.headers['x-access-token'];
        if (!token) {
            response.status(403).send({
                success: false,
                message: "No token provided."
            });
        } else {
            jsonwebtoken.verify(token, secretKey, function (err, decoded) {
                 if (err) {
                    response.status(403).send({success: false, message: "Invalid Token."});
                 } else {
                    request.decoded = decoded;
                    next();
                 }
            });
        }
    });

    api.get("/me", function(request, response) {
        response.json({ success: true, user: request.decoded });
    });

    return api;
};