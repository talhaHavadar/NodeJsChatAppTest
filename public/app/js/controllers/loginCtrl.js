app.controller('LoginController', function ($location, AuthUser) {
    var ctrl = this;
    ctrl.error = null;
    ctrl.loginData = {};
    
    if (AuthUser.isLoggedin())
        $location.path("/");
    
    ctrl.login = function () {
        ctrl.error = null;
        AuthUser.login(ctrl.loginData.username, ctrl.loginData.password).then(function (data) {
            //Success
            if(!data.success)
                ctrl.error = data.message;
            else
                $location.path("/");
        }, function (data) {
            //Error case
            ctrl.error = "Something went wrong...";
        })
    };
});