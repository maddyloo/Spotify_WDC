

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
var tableData = [];
tableau.registerConnector(myConnector);

function get_everything(){
	tableau.log("get_everything")
	
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
		//tableau.log("final cb : " + tableData);
		tableData.push({"playlist" : name, "song" : 1})
		table.appendRows(tableData);
		//doneCallback();
	}

	function get_playlists(){
		tableau.log("get_playlists")
		var cd = JSON.parse(tableau.connectionData);
		user_id = cd[1]
		var plurl = 'https://api.spotify.com/v1/users/' + cd[1] + '/playlists';

		$.ajax({
			url: plurl,
			headers: {
				'Authorization' : 'Bearer ' + cd[0]
			},
			success:  function(data) {
				tableau.log("data")
				// Iterate over the JSON object
				for (i=0; i<data["items"].length; i++){
					var success = false
					var playlist_name = data["items"][i]["name"];
					var playlist_id = data["items"][i]["id"]
					tableData.push({"playlist": playlist_name});
					playlists.push(playlist_name)
					//get_songs(playlist_id);
					//tableau.log(data);
					// var surl = 'https://api.spotify.com/v1/users/' + cd[1] + '/playlists/' + playlist_id + '/tracks';
					// $.ajax({
					// 	url: surl,
					// 	headers: {
					// 		'Authorization' : 'Bearer ' + cd[0]
					// 	},
					// 	success: final_cb							
					// })
				};
				//tableau.log(tableData)
				//tableData.push({"playlist" : playlist_name, "songs" : 1})
			}
		})
	}

}


function get_playlists(){	
	var cd = JSON.parse(tableau.connectionData);
	user_id = cd[1]
	var plurl = 'https://api.spotify.com/v1/users/' + cd[1] + '/playlists';
	$.ajax({
		url: plurl,
		headers: {
			'Authorization' : 'Bearer ' + cd[0]
		},
		success:  function(data) {
			tableau.log(data)
			// Iterate over the JSON object
			for (i=0; i<data["items"].length; i++){
				//var success = false
				var playlist_name = data["items"][i]["name"];
				var playlist_id = data["items"][i]["id"]
				tableData.push({"playlist": playlist_name});
				playlists.push(playlist_name)
				tableau.log(playlist_name)
			};
			tableau.log(playlists)
			//tableData.push({"playlist" : playlist_name, "songs" : 1})
		}
	})
}

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
	get_playlists();
	tableau.submit();
	
	
	// tableau.submit();
}




(function () {
	get_everything();
	tableau.log(playlists)
	// tableau.registerConnector(myConnector);

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
			{ id: "songs", alias: "Song Number", dataType : tableau.dataTypeEnum.int },
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
		
		table.appendRows(tableData);
		doneCallback();	
	};
	
	//tableau.registerConnector(myConnector);

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