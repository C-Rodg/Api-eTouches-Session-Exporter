app.controller('EtouchesCtrl', function($base64, $scope, etouchService){

	var QueryString = function () {
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  //return no paramters
	  if(query === ''){
	  	return false;
	  }
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	        // If first entry with this name
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = decodeURIComponent(pair[1]);
	        // If second entry with this name
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
	      query_string[pair[0]] = arr;
	        // If third or later entry with this name
	    } else {
	      query_string[pair[0]].push(decodeURIComponent(pair[1]));
	    }
	  } 
	    return query_string;
	}();

	//Helper function to re-render inputs
	$scope.renderInputs = function() {
		setTimeout(function(){componentHandler.upgradeDom()});
	}	

	function Session(key, topic, category, startDate, startTime, endTime, description, location){
		this.Key = key;
		this.Topic = topic;
		this.Printed = "";
		this.Category = category;
		this.StartDate = startDate;
		this.StartTime = startTime;
		this.EndDate = startDate;
		this.EndTime = endTime;
		this.Description = description;
		this.Location = location;
		this.Tags = key;
	}
	
	//Export Csv from table data
	$scope.exportCsv = function(){
		if(!$scope.etouch.authorized){
			return false;
		}
		if ($scope.etouch.sessions.length  <= 0){
			return false;
		}
		return $scope.etouch.sessions;
	};

	//Get sessions
	$scope.findSessions = function(){
		if(!$scope.etouch.authorized){
			return false;
		}
		$scope.etouch.results = {};		
		
		//Get Sessions
		var getSessions = etouchService.requestSessions($scope.etouch.url, $scope.etouch.accessToken, $scope.etouch.eventId);	
		$scope.etouch.error = false;
		//Resolve getSessions
		getSessions.then(function(obj){
			console.log(obj);
			if(obj.statusText === 'OK' && obj.data){
				$scope.etouch.results = obj.data;	
				if(obj.data.error){
					if(obj.data.error.data === 'No sessions found.'){
						$scope.etouch.sessionNumbers = 0;
						$scope.etouch.success = true;
						return false;
					} else {
						console.log(obj.data.error);
						$scope.etouch.error = true;
						return false;
					}
				}
				$scope.etouch.sessions = [];
				$scope.etouch.sessionNumbers = obj.data.length;
				$scope.etouch.showModal = true;				
				$scope.startSessionCalls(obj.data);	
			} else {
				console.log("ERROR");
				console.log(obj);
				$scope.etouch.error = true;			
			}
		},
			function(err){
				console.log("ERROR");
				console.log(err);
				$scope.etouch.error = true;			
			}
		);
	};

	$scope.startSessionCalls = function(data) {
		if(data.length >0){
			var first = data[0];
			$scope.makeSessionCall(first, data);
		} else {
			$scope.etouch.success = true;
			$scope.etouch.ready = true;
			$scope.etouch.showModal = false;
		}
	};

	$scope.makeSessionCall = function(session, sessionList) {
		var getThisSession = etouchService.getThisSession($scope.etouch.url, $scope.etouch.accessToken, $scope.etouch.eventId, session.sessionid, session.sessionkey);
		var currentList = sessionList;
		getThisSession.then(function(obj){
			var sKey = obj.data.sessionid + '_' + obj.data.sessionkey;
			var desc = '';
			if(obj.data.descriptions){
				desc = obj.data.descriptions.eng;
			}
			var session = new Session(sKey, obj.data.reportname, 'Session', obj.data.sessiondate, obj.data.starttime, obj.data.endtime, desc, '');
			$scope.etouch.sessions.push(session);
			currentList.shift();
			$scope.startSessionCalls(currentList);
		}, function(error) {
			console.log("ERROR");
			console.log(error);
			$scope.etouch.showModal = false;
			$scope.etouch.error = true;
		});
	};

	$scope.connect = function() {
		$scope.etouch.showModal = false;		
		var authorize = etouchService.logIn($scope.etouch.url, $scope.etouch.accountId, $scope.etouch.apiKey);
		authorize.then(function(obj){
			console.log(obj);
			//Ensure response is OK
			if(obj.statusText === 'OK' && obj.data) {									
				//Check for sessionId element
				if(obj.data.accesstoken){
					$scope.etouch.accessToken = obj.data.accesstoken;
					$scope.etouch.authorized = true;
					$scope.etouch.authorizedText = "Authorized";
					$scope.findSessions();
				} else {
					console.log("ERROR: invalid credentials.");
					$scope.etouch.error = true;
				}									
			} else {
				console.log("ERROR: unsuccessful request.");
				$scope.etouch.error = true;
			}
		},
			function(err){
				console.log("ERROR");
				console.log(err);
				$scope.etouch.error = true;
			}
		);
	};

	$scope.etouch = {};
	$scope.etouch.url = 'https://www.eiseverywhere.com/api/v2/';
	$scope.etouch.accountId = '';
	$scope.etouch.apiKey = '';
	$scope.etouch.eventId = '';
	$scope.etouch.accessToken = '';
	$scope.etouch.authorizedText = 'Authorize';
	$scope.etouch.authorized = false;
	
	$scope.etouch.results = {};
	$scope.etouch.success = false;
	$scope.etouch.error = false;
	$scope.etouch.ready = false;
	$scope.etouch.sessionNumbers = 0;
	$scope.etouch.sessions = [];
	$scope.etouch.showModal = false;
	
	$scope.csvOrder = ["Key", "Topic", "Printed", "Category", "StartDate", "StartTime", "EndDate", "EndTime", "Description", "Location", "Tags", "TrackAttendance", "Capacity"];

	//Import url paramaters if they exist
	if(QueryString){
		if(QueryString.e){
			$scope.etouch.eventId = QueryString.e;
		}
		if(QueryString.k){
			$scope.etouch.apiKey = QueryString.k;
		}		
		if(QueryString.a){
			$scope.etouch.accountId = QueryString.a;
		}
	}

	$scope.renderInputs();

});

//Entire card element
app.directive('etouchCard', function() {
	return {
		restrict: 'E',
		templateUrl: './js/templates/etouchCard.html'
	}
});

//Passbook Settings Element
app.directive('etouchSettings', function() {
	return {
		restrict: 'E',
		templateUrl: './js/templates/etouchSettings.html',
		link: function($scope){
			$scope.renderInputs();
		}
	}
});