//AS OF 11am 8/31/2016 this code works to get a list of user playlists

var myConnector = tableau.makeConnector();

var CLIENT_ID = "0d78319bc5524946a22a085d45ade53c";
var REDIRECT_URI = "http://localhost:8888/WDC_2.0/my stuff/Spotify/index.html";

var url = "https://accounts.spotify.com/authorize/?client_id=" + 
CLIENT_ID + 
"&response_type=token&redirect_uri=" + REDIRECT_URI + 
"&scope=user-read-private%20playlist-read-private%20user-library-read";


var user_id = "";
var accessToken = "";
var playlists = [];
var playlist_names = [];
var song_storage = [];


function get_user_info(token,accessCallback) {
	$.ajax({
		url: 'https://api.spotify.com/v1/me',
		headers: {
			'Authorization': 'Bearer ' + token
		},
		success: accessCallback
	})
};

function accessCallback(response){
	user_id = response["id"];
	tableau.connectionData = JSON.stringify([accessToken, user_id ]);
	tableau.connectionName = "Spotify Playist Connector";
	tableau.submit();
}


(function () {
	
	myConnector.getSchema = function (schemaCallback) {
		// var cols = [
		// 	{ id : "list", alias : "playlist", dataType : tableau.dataTypeEnum.string }
		// ];
		// var tableInfo = {
		// 	id : "Spotify",
		// 	alias : "Get SPotify Playlists",
		// 	columns : cols
		// };
		// schemaCallback([tableInfo]);
		var cols = [
			{ id: "song", alias: "Song Name", dataType : tableau.dataTypeEnum.string },
			{ id: "playlist", alias: "Playlist Name", dataType : tableau.dataTypeEnum.string }
		];

		var tableInfo = {
			id : "Spotify",
			alias : "Spotify Song Data",
			columns : cols
		};
		schemaCallback([tableInfo]);
	};

	function get_songs(playlist_id) {
		var cd = JSON.parse(tableau.connectionData);
		//tableau.log(cd[0]);
		var surl = 'https://api.spotify.com/v1/users/' + cd[1] + '/playlists/' + playlist_id + '/tracks';
		$.ajax({
			url: surl,
			headers: {
				'Authorization' : 'Bearer ' + cd[0]
			},
			success: final_cb
			})
		};

	function final_cb(data) {
		tableau.log(data);
		table.appendRows(tableData);
		doneCallback();
	}
	
	myConnector.getData = function(table, doneCallback) {
		var cd = JSON.parse(tableau.connectionData);
			user_id = cd[1]
			var plurl = 'https://api.spotify.com/v1/users/' + cd[1] + '/playlists';
			
			$.ajax({
				url: plurl,
				headers: {
					'Authorization' : 'Bearer ' + cd[0]
				},
				success:  function(data) {
					tableData = [];
					
					// Iterate over the JSON object
					for (i=0; i<data["items"].length; i++){
						var playlist_name = data["items"][i]["name"];
						var playlist_id = data["items"][i]["id"]
						tableData.push({"list": playlist_name});
						//get_songs(playlist_id);
						//tableau.log(data);
						var songs = $.ajax({
							url: surl,
							headers: {
								'Authorization' : 'Bearer ' + cd[0]
							},
							success: final_cb
						})
					};
					tableau.log(songs)
					table.appendRows(tableData);
					doneCallback();
				}
			})
	};
	
	tableau.registerConnector(myConnector);

})();

$(document).ready(function () {
	$("#submitButton").click(function () {
		var path = window.location.href;
		tableau.log(path)
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