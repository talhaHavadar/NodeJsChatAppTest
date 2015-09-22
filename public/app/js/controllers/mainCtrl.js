app.controller("MainController", function($http, $location, AuthUser) {
	var ctrl = this;
    ctrl.loggedin = AuthUser.isLoggedin();
    ctrl.logout = function(){
        if(AuthUser.isLoggedin()) {
            AuthUser.logout().then(function (data) {                
                var loggedout = !data.isSet;
                if (loggedout) {
                    ctrl.loggedin = false;
                }
            });
        }
    };
    ctrl.userInfo = {};
    if (AuthUser.isLoggedin()) {
        $http.get("/api/me").then(function (data) {
            var rawData = data.data;
            if (rawData.success) {
                ctrl.userInfo.name = rawData.user.name;
                ctrl.userInfo.username = rawData.user.username;
                ctrl.userInfo.chat_name = rawData.user.chat_name;
                console.log(angular.toJson(ctrl.userInfo));
            }
        });
    }
});