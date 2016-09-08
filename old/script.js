document = "/index.html";

document.getElementById("select").style.visibility = "hidden";

function prompt_login() {

	var CLIENT_ID = "0d78319bc5524946a22a085d45ade53c";
	var REDIRECT_URI = "http://localhost:8888/Spotify_WDC/index.html";

	var url = "https://accounts.spotify.com/authorize/?client_id=" + 
		CLIENT_ID + 
		"&response_type=token&redirect_uri=" + REDIRECT_URI + 
		"&scope=user-read-private%20user-read-email";

	var w = window.location.assign(url);
	console.log(window.location.href);
};

// can we delay this to the second window load?
window.onload = function(){
	var path = window.location.href;
	var accessToken = path.split("access_token=")[1].split("&token_type")[0];
	console.log(accessToken)


	var callback = function(data){
		console.log(data);
		var playlists = data.items;
		var select = document.getElementById("select")
		document.getElementById("login").style.visibility = "hidden";
		// add saved songs option first
		var text = "<h2>Select Playlists to import</h2><label><input type=checkbox value=Saved Songs><b>Saved Songs<b></label><br>";
		for (i=0; i < playlists.length; i++){
			//text += "<option value=" + playlists[i]["name"] + ">" + playlists[i]["name"] + "</option>"
			text += "<label><input type=checkbox value=" + playlists[i]["name"] + ">" + playlists[i]["name"] + "</label><br>";
		};
		select.innerHTML = text;
		select.style.visibility = "visible";

		// main.innerHTML = playlists;
	}

	var get_user_info = function(token, cb) {
		$.ajax({
			url: 'https://api.spotify.com/v1/me',
			headers: {
			    'Authorization': 'Bearer ' + token
			},
			success: function(response) {
				console.log(response);
				$.ajax({
				url: 'https://api.spotify.com/v1/users/' +response["id"] + '/playlists?limit=50',
				headers: {
					'Authorization': 'Bearer ' + token
				},
				success: cb
		})
			}
		})
	};

	get_user_info(accessToken, callback);
}