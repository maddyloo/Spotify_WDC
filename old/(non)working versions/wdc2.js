var myConnector = tableau.makeConnector();
var CLIENT_ID = "0d78319bc5524946a22a085d45ade53c";
var REDIRECT_URI = "http://localhost:8888/WDC_2.0/my stuff/Spotify/index.html";

var url = "https://accounts.spotify.com/authorize/?client_id=" + 
		CLIENT_ID + 
		"&response_type=token&redirect_uri=" + REDIRECT_URI + 
		"&scope=user-read-private%20playlist-read-private%20user-library-read";

var user_id = ""
var playlists = [];
var playlist_names = [];
var song_storage = [];

// uses access token to retrieve up to 50 playlists from a user
// TODO: get more playlists using offset?
function get_user_info(token, cb) {
	$.ajax({
		url: 'https://api.spotify.com/v1/me',
		headers: {
		    'Authorization': 'Bearer ' + token
		},
		success: function(response) {
			user_id = response["id"];
			$.ajax({
			url: 'https://api.spotify.com/v1/users/' + response["id"] + '/playlists?limit=50',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: cb
				})
		}
	})
};

var playlist_callback = function(data){
	
	var cb_playlist = function return_songs(data){
		song_storage.push(data);
		//console.log(super_storage.length)
	}

	var err = function(){
		console.log("error")
	}

	playlists = data.items;
	//console.log(accessToken)
	//console.log(user_id)
	// GET SONGS?
	for (i=0;i<50; i++){
		// https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
		// console.log(playlists[i])
		var url = 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlists[i]["id"] + '/tracks';
		playlist_names.push(playlists[i]["name"])
		$.ajax({
		url: url,
		headers: {
			'Authorization' : 'Bearer ' + accessToken
		},
		success: cb_playlist,
		error: err
		})
	}
}

//*** TRACK STAGE ***//
// function get_playlist(token, user, cb_playlist, playlist_id){
// 	for (j=0; j<1; j++) {
// 		var url = 'https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist_id + '/tracks?limit=100';
// 		$.ajax({
// 			url: url,
// 			headers: {
// 				'Authorization' : 'Bearer ' + token
// 			},
// 			success:
// 			cb_playlist,
// 		})
// 	}
// }

var callback_playlist = function(data, offset){
	for (i=0; i<data["items"].length; i++){
		var song = data["items"][i]["track"]["name"];
		var added = data["items"][i]["added_at"];
		var artist = data["items"][i]["track"]['artists'][0]['name'];
		var popularity = data["items"][i]["track"]["popularity"];
		super_storage.push({"playlist": playlist_name,"song":song,"added":added, "artist":artist, "popularity":popularity})
	}
}

function run_wdc(){
	
	
	// If the access token has been returned, kick off playlist retrieval
	var path = window.location.href;
	if (path.includes("access_token") == false ) {
		var w = document.location.assign(url);
	}
	else {
		path = window.location.href;
		accessToken = path.split("access_token=")[1].split("&token_type")[0];

		// calls authentication/playlist retrieval function
		// Returns 50 most recent playlists
		get_user_info(accessToken, playlist_callback);

		//for (var i=0; i<playlists.length; i++){
		for (var i=0; i<1; i++){
			//console.log(user_id)
			//get_playlist(accessToken, user_id, callback_playlist)
		}

	}
}

function export_data(){
	console.log(song_storage, playlist_names)

	var myConnector = tableau.makeConnector();

	myConnector.getSchema = function(schemaCallback) {

	}

	myConnector.getData = function(table, doneCallback) {

	}

	tableau.registerConnector(myConnector);
}