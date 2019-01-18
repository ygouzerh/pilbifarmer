var server = "http://localhost:3000/"
// Dashboard Content Controller
App.controller('DashboardCtrl', ['$scope', '$http','$localStorage', '$window',
    function ($scope, $http, $localStorage, $window) {
        $scope.selectedFerme = false;
        $scope.selectedPlante = false;
        $scope.autoArrosage = true;
        $scope.autoLumiere = true;
        $scope.commandes = [];

        $http({
            method: 'GET',
            url: server + 'raspy',
            headers: { 'Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="}
          }).then(function successCallback(response) {
            $scope.raspys = response.data
    
          }, function errorCallback(response) {
            
    
        });
        
        $scope.selectRaspy = function(raspy){
            $scope.selectedFerme = true;
            $http({
                method: 'GET',
                url: server + 'plantes/' + raspy.raspyID,
                headers: { 'Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="}
              }).then(function successCallback(response) {
                $scope.plantes = response.data
              }, function errorCallback(response) {
                
        
            });
        }

        $scope.selectPlante = function(plante){
            $http({
                method: 'GET',
                url: server + 'modes/' + plante.planteID,
                headers: { 'Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="}
              }).then(function successCallback(response) {
                $scope.modes = response.data
                $scope.modes.forEach(element => {
                    if (element.arrosage){
                        if(element.automatique)
                            $scope.autoArrosage = true;
                        else
                            $scope.autoArrosage = false;
                    }
                    else {
                        if(element.automatique)
                            $scope.autoLumiere = true;
                        else
                            $scope.autoLumiere = false;
                    }
                })
                $scope.selectedPlante = true
                $scope.plante = plante
                loadCommandes($scope.plante)
                
              }, function errorCallback(response) {});      
        }

        loadCommandes = function(plante){
            if($scope.autoArrosage){
                $http({
                    method: 'GET',
                    url: server + 'commandes/action/' + plante.planteID + '/arrosage',
                    headers: { 'Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="}
                  }).then(function successCallback(response) {
                    console.log(response.data)
                    $scope.arrosagecommandes = response.data;
                  }, function errorCallback(response) {
                    
            
                });
            }
            if($scope.autoLumiere){
                $http({
                    method: 'GET',
                    url: server + 'commandes/action/' + plante.planteID + '/light',
                    headers: { 'Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="}
                  }).then(function successCallback(response) {
                    console.log(response.data)
                    $scope.lumierecommandes = response.data;
                  }, function errorCallback(response) {
                    
            
                });
            }
        }

        $scope.updateMode = function(arrosage,state){
            
            $http({
                method: 'POST',
                url: server + 'modes/' + $scope.plante.planteID,
                headers: { 'Content-Type': 'application/json','Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="},
                data: {"state":state,"arrosage":arrosage}
              })
              .then(function (success) {
                    if(arrosage){
                        $scope.autoArrosage = !$scope.autoArrosage
                    }
                    else {
                        $scope.autoLumiere  = !$scope.autoLumiere
                    }
                    loadCommandes($scope.plante)
                  }, function (error) {
                console.log("error")
              });

        }

            
    }
]);
