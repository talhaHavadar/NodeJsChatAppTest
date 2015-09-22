app.config(function($routeProvider,$locationProvider){
        $locationProvider.html5Mode(true);
        $routeProvider
            .when("/", {
                templateUrl: "app/views/home.html"      
            })
            .when("/login", {
                templateUrl: "app/views/login/login.html"
            })
            .when('/signup', {
                templateUrl:"app/views/signup/signup.html"
            })
            .when("/chat", {
            	templateUrl: "app/views/chatroom/index.html"
            });
});