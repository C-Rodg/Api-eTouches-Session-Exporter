
<%@ LANGUAGE=VBScript %>
<% OPTION EXPLICIT %>

<%
	Dim password
	password = Request.QueryString("password")(1)
	Dim eventId
	eventId = Request.QueryString("eventId")(1)
	Dim location
	location = Request.QueryString("url")(1)
	Dim url
	url = "https://www." & location & eventId & "/sessions.json"

	Dim credentials
	credentials = "Basic " & password
	
	Dim mergeRequest
	Set mergeRequest = CreateObject("MSXML2.XMLHTTP")
	mergeRequest.open "GET", url, False
    mergeRequest.setRequestHeader "Content-Type", "application/json; charset=utf-8"
    mergeRequest.setRequestHeader "Authorization", credentials
	
	mergeRequest.send

	Dim myResponse
	myResponse = mergeRequest.responseText

	Response.Write(myResponse)
	Response.End
%>