app.factory('SignupService', ['$http', '$q', function($http, $q) {
    var signFactory = {};
    
    signFactory.signup = function(userData) {
        var deferred = $q.defer();
        $http.post('/api/signup', {
            name: userData.name,
            chat_name: userData.chat_name,
            username: userData.username,
            password: userData.password
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (data) {
            deferred.reject(data.data);
        });
        return deferred.promise;
    };
    
    return signFactory;
}]);