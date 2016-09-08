//AS OF 11am 9/1/2016 this code works to get a list of user playlists

var myConnector = tableau.makeConnector();

var CLIENT_ID = "0d78319bc5524946a22a085d45ade53c";
var REDIRECT_URI = "http://localhost:8888/WDC_2.0/my stuff/Spotify/index.html";

var url = "https://accounts.spotify.com/authorize/?client_id=" + 
CLIENT_ID + 
"&response_type=token&redirect_uri=" + REDIRECT_URI + 
"&scope=user-read-private%20playlist-read-private%20user-library-read";

var user_id = "";
var accessToken = "";
var tableData = [];
var playlistData = [];
var songData = [];


function get_user_info(token,accessCallback) {
	$.ajax({
		url: 'https://api.spotify.com/v1/me',
		headers: {
			'Authorization': 'Bearer ' + token
		},
		success: accessCallback
	})
};

function get_playlists(playlistCallback){
	tableau.log(tableau.connectionData)
	//var cd = JSON.parse(tableau.connectionData);
	//user_id = cd[1];
	//token = cd[0];
	//tableau.log(cd)
	
	var plurl = 'https://api.spotify.com/v1/users/' + user_id + '/playlists';
	
	$.ajax({
		url: plurl,
		headers: {
			'Authorization' : 'Bearer ' + accessToken
		},
		success:  playlistCallback
	})
}

function playlistCallback(data){
	for (i=0; i<data["items"].length; i++){
		var playlist_name = data["items"][i]["name"];
		var playlist_id = data["items"][i]["id"];
		var oid = data["items"][i]["owner"]["id"];
		if (oid == user_id ){
			playlistData.push({"playlist": playlist_name, "id" : playlist_id});
			//tableau.con
		}
	};
	// this is where we need to add playlist data to connectionData

	//tableau.connectionData = JSON.stringify('{"token": accessToken, "id": user_id, "playlists": playlistData}');
	//tableau.connectionData = JSON.stringify([ accessToken , user_id ])
	//tableau.log(playlistData)
	tableau.connectionData = JSON.stringify([playlistData, user_id, accessToken])
	//tableau.log(tableau.connectionData)
	tableau.connectionName = "Spotify Playlist Connector";
	//tableau.connectionData.push(playlistData);
	tableau.submit();
	
}

function accessCallback(response){
	user_id = response["id"];
	//tableau.log("playlistData: " + playlistData)
	
	//tableau.connectionData = JSON.stringify([accessToken, user_id ]);
	
	// tableau.connectionName = "Spotify Playist Connector";
	get_playlists(playlistCallback);
}

(function () {
	
	myConnector.getSchema = function (schemaCallback) {
		var cols = [
			{ id: "song", alias: "Song Name", dataType : tableau.dataTypeEnum.string },
			{ id: "date_added", alias: "Date Added", dataType : tableau.dataTypeEnum.datetime},
			{ id: "playlist", alias: "Playlist Name", dataType : tableau.dataTypeEnum.string }
		];
		
		var tableInfo = {
			id : "Spotify",
			alias : "Spotify Song Data",
			columns : cols
		};
		schemaCallback([tableInfo]);
	};
	
	
	myConnector.getData = function(table, doneCallback) {
		//tableau.log(tableData);
		var cd = JSON.parse(tableau.connectionData);
	//tableau.log()
	var async_request = [];
	var songs = [];

	var user_id = cd[1];
	var accessToken = cd[2];
	var playlistData = cd[0];
	for(i in playlistData){
		var id = playlistData[i]['id'];
		var name = playlistData[i]['playlist']
		tableau.log(name)
		var surl = 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + id + '/tracks';
		
		async_request.push(
		$.ajax({
			url: surl,
			headers: {
				'Authorization' : 'Bearer ' + accessToken
			},
			success: function(data){
					songs.push(data);
			}
		})
		)
		
	}
	
// song_name, playlist, added

	$.when.apply(null, async_request).done( function(){
		//tableau.log(songs);
		//tableData.push({"playlist" : "YAY", "songs" : "WOOH"});
		//tableau.log(playlistData["6HWAeg4fRRRwo1lRkfNQff"]);
		var playlist_name; 
		for (i in songs){
			var song_names = songs[i]["items"]
			var playlist_id = songs[i]["href"].match(/([^/]*\/){8}/)[1].slice(0, -1)
			//tableau.log(playlist_name)
			// var ID = "3PLMiZHKWtFT0EMzu8HWta";

			for (j in song_names){

				for (k in playlistData){

					if (playlist_id == playlistData[k]["id"]){
						playlist_name = playlistData[k]["playlist"]
						tableau.log(playlist_name)
					}
				}

				var song_title = song_names[j]["track"]["name"]
				var date_added = song_names[j]["added_at"]
				//tableau.log(song_title)
				tableData.push({"playlist" : playlist_name, "song" : song_title, "date_added": date_added})
			}
		}
		table.appendRows(tableData);
		doneCallback();
	});
		// table.appendRows(tableData);
		//doneCallback();
	};
	
	tableau.registerConnector(myConnector);
	
})();

$(document).ready(function () {
	$("#submitButton").click(function () {
		var path = window.location.href;
		// if (path.includes("access_token") == false ) {
		if (path.indexOf("access_token") == -1) {
			var w = document.location.assign(url);
		}
		else {
			path = window.location.href;
			accessToken = path.split("access_token=")[1].split("&token_type")[0];
			get_user_info(accessToken, accessCallback);
		}
	});
});	