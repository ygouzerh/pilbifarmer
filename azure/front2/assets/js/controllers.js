var server = "http://localhost:3000/"
// Dashboard Content Controller
App.controller('DashboardCtrl', ['$scope', '$http','$localStorage', '$window',
    function ($scope, $http, $localStorage, $window) {
        moment.locale('fr');
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

        $scope.log = function(){
            console.log("changed")
            console.log($scope.date)
        }

        $scope.startDateBeforeRender = function($dates) {
            const todaySinceMidnight = new Date();
              todaySinceMidnight.setUTCHours(0,0,0,0);
              $dates.filter(function (date) {
                return date.utcDateValue < todaySinceMidnight.getTime();
              }).forEach(function (date) {
                date.selectable = false;
              });
          };
          
        loadCommandes = function(plante){
            if($scope.autoArrosage){
                $http({
                    method: 'GET',
                    url: server + 'commandes/action/' + plante.planteID + '/water',
                    headers: { 'Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="}
                  }).then(function successCallback(response) {
                    
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

        $scope.submitArr = function(){
            console.log({'date':$scope.arrosagedate,'duree':$scope.arrosageduree})
            $http({
                method: 'POST',
                url: server + 'commandes/insert',
                headers: { 'Content-Type': 'application/json','Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="},
                data: {"planteID":$scope.plante.planteID,"date_heure":$scope.arrosagedate.toJSON(),"period":$scope.arrosageduree,"action":"water"}
              })
              .then(function (success) {
                loadCommandes($scope.plante)
                  }, function (error) {
                console.log("error")
              });
        }
            
        $scope.submitLum = function(){
            console.log({'date':$scope.lumieredate,'duree':$scope.lumiereduree})
            $http({
                method: 'POST',
                url: server + 'commandes/insert',
                headers: { 'Content-Type': 'application/json','Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="},
                data: {"planteID":$scope.plante.planteID,"date_heure":$scope.lumieredate.toJSON(),"period":$scope.lumiereduree,"action":"light"}
              })
              .then(function (success) {
                loadCommandes($scope.plante)
                  }, function (error) {
                console.log("error")
              });

        }

        $scope.delete = function(id){
            $http({
                method: 'POST',
                url: server + 'commandes/del/'+id,
                headers: { 'Content-Type': 'application/json','Authorization': "Basic ZmFybWVyOlBsYW50MzYwJA=="}
              })
              .then(function (success) {
                loadCommandes($scope.plante)
                  }, function (error) {
                console.log("error")
              });
        }
    }
]);
