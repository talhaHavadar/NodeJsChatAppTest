app.controller('SignupController', function ($location, AuthUser, SignupService) {
    var ctrl = this;
    ctrl.error = null;
    ctrl.userData = {};
    ctrl.signup = function () {
        ctrl.error = null
        SignupService.signup(ctrl.userData).then(function (data) {
            if (!data.success)
                ctrl.error = data.message;
            else {
                AuthUser.login(ctrl.userData.username, ctrl.userData.password).then(function (data) {
                    if (data.success) {
                        $location.path('/');                
                    }
                });
            }
        }, function (data) {
            ctrl.error = data.message;
        })
    }
});