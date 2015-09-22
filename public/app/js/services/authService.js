/**
* AuthService Module
*
* Description
*/
app.factory('AuthUser', ['$http', '$q', 'AuthToken', function($http, $q, AuthToken){
		var authFactory = {};

		authFactory.login = function(username, password) {
			var deferred = $q.defer();
			$http.post('/api/login', {
				username: username,
				password: password
			}).then(function(data){                
				AuthToken.setToken(data.data.token);
				deferred.resolve(data.data);
			}, function(data){
				deferred.reject(data);
			});
			return deferred.promise;
		};

		authFactory.logout = function() {
			return AuthToken.setToken();
		};

		authFactory.isLoggedin = function () {
			if (AuthToken.getToken()) {
				return true;
			} else {
				return false;
			}
		};

		authFactory.getUser = function () {
			var deferred = $q.defer();
			if (AuthToken.getToken()) {
				$http.get('/api/me').then(function (data) {
					console.log("Get User; data:" + angular.toJson(data));
					deferred.resolve(data);
				}, function (data) {
					console.log("Get User; data:" + angular.toJson(data));
					deferred.reject(data);
				});
				return deferred.promise;
			} else {
				deferred.reject({ success:false, message: "User not logged in." });
				return deferred.promise;
			}
			
		};

		return authFactory;
	}]);

	app.factory('AuthToken', ['$window', "$q", function($window, $q){
		var tokenFactory = {};

		tokenFactory.getToken = function () {
			return $window.localStorage.getItem('token');
		};

		tokenFactory.setToken = function(token) {
			var deferred = $q.defer();
            var data = {};
            if (token) {
				$window.localStorage.setItem("token", token);
                data.isSet = true;
                deferred.resolve(data);
			} else {
				$window.localStorage.removeItem("token");
                data.isSet = false;
                deferred.resolve(data);
			}
            return deferred.promise;
		};

		return tokenFactory;
	}]);
	app.factory('AuthInter', function($q, $location, AuthToken){

		var request = function (config) {
			var token = AuthToken.getToken();
			if (token) {
				config.headers['x-access-token'] = token;
			}
			return config;
		};

		var responseError = function(response) {
			if (response.status == 403) {
				$location.path("/");
			}
			return $q.reject(response);
		};
		return {
			request: request,
			responseError: responseError
		};

	});
	app.config(['$httpProvider', function($httpProvider) {
	    $httpProvider.interceptors.push('AuthInter');
	}]);