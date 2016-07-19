app.service('etouchService', function($http){
	
	//Make session request
	this.requestSessions = function(url, accessToken, eventId){
		//Ensure form has fields
		if (url === '' || eventId === '' || accessToken === ''){
			return false;
		}

		//Build query string
		url += 'ereg/listSessions.json';
		url += '?accesstoken=' + accessToken;
		url += '&eventid=' + eventId;
		return $http.get(url);		
	};

	//Make specific session request
	this.getThisSession = function(url, accessToken, eventId, sessionId, sessionKey){
		if (url === '' || accessToken === '' || eventId === '' || sessionId === '' || sessionKey === ''){
			return false;
		}

		url += 'ereg/getSession.json'
		url += '?accesstoken=' + accessToken;
		url += '&eventid=' + eventId;
		url += '&sessionid=' + sessionId;
		url += '&sessionkey=' + sessionKey;

		return $http.get(url);
	}

	//Authorize this client
	this.logIn = function(url, accountId, apiKey){
		if(url === '' || accountId === '' || apiKey === ''){
			return false;
		}
		url += 'global/authorize.json?';
		url += 'accountid=' + accountId;
		url += '&key=' + apiKey;
		return $http.get(url);
	};
});