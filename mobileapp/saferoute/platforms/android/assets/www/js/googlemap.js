function GoogleMap(){
 	this.initialize = function(){
		var map = showMap();
	}
 
 	var showMap = function(){
		var mapOptions = {
			zoom: 4,
			center: new google.maps.LatLng(-33, 151),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
 
		var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
 
		return map;
	}
}

function onDeviceReady(){
	<p>Ishita</p>
    var map = new GoogleMap();
    map.initialize();
}