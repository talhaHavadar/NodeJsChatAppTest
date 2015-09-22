"use strict";
/**
* ChatCtrl Module
*
* Description
*/
app.controller('ChatController', ['$scope', '$http', 'AuthUser', '$location', function($scope, $http, AuthUser, $location){
    if (!AuthUser.isLoggedin()) {
        $location.path("/");
    }
    $scope.userInfo = {};
    $scope.isConnected = false;
    $scope.status = "CONNECTING...";
    
    $scope.users = [];
    $scope.messages = [];

    
    
    $http.get("/api/me").then(function (data) {
        var rawData = data.data;
        if (rawData.success) {
            $scope.userInfo.name = rawData.user.name;
            $scope.userInfo.username = rawData.user.username;
            $scope.userInfo.chat_name = rawData.user.chat_name;
            connectServer();
        } else {
            alert("We get an error while fetching your user data please try again.");
            $location.path('/');
        }
    });
    var server = null;
    var connectServer = function() {
        server = io.connect("http://localhost:3000");//https://glacial-forest-2223.herokuapp.com
        
        server.on('connected', function(data){
            console.log(data);
            $scope.isConnected = true;
            $scope.status = "CONNECTED!!";
            $scope.$apply();
            server.emit("join", $scope.userInfo);
        });

        server.on('users', function(data) {
            $scope.users.push(data);
            $scope.$apply();
        });
        
        server.on("messages", function(data) {
            $scope.messages.push(data);
            $scope.$apply();
        });

        server.on('leave', function(data){
            deleteUser(data);
            $scope.$apply();
        });

    }
    var deleteUser = function(username) {
        for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].username === username) {
                $scope.users.splice(i,1);
                return;
            } 
        };
    }
/*
    $scope.$on("$destroy", function(){
        console.log("destroy");
        if (server) {
            server.emit("leave", $scope.userInfo.username);
        }
    });
*/
    $scope.sendMessage = function() {
        if($scope.message != "") {
            server.emit("messages", { username: $scope.userInfo.username, chat_name: $scope.userInfo.chat_name, message: $scope.message });
            $scope.messages.push({ username: $scope.userInfo.username, chat_name: $scope.userInfo.chat_name, message: $scope.message });
            $scope.message = "";
        }
    };
    
}]);

app.directive('scrollToBottom', function(){
    return {
        scope: {
          scrollToBottom: "="
        },
        link: function (scope, element) {
          scope.$watchCollection('scrollToBottom', function (newValue) {
            if (newValue)
            {
              element[0].scrollTop = element[0].scrollHeight;
            }
          });
        }
    };
});