/****************************************************************************************************************************************************/
//                                                           
/**
  The code is divided into two sections.
  1. Report an unsafe location.
  2. Safe Route
*/
/****************************************************************************************************************************************************/
 /** Common utility. */

  /**
  Takes address and returns with latlng object.
  */
 function geoCode(address, callBack) {
    var latLong = "";
    $.ajax({
        url: "http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=false",
        type: "POST",
        async : false,
        success: function(res) {
          if(res.results.length > 0) {
            latLong = res.results[0].geometry.location.lat + "," + res.results[0].geometry.location.lng;
            callBack(latLong);
          }
        },
        error: function(responseText) {
            console.log(responseText);
        }
    });
    return latLong;
}

/**
  Gets the address by taking latitude and longitude. 
*/
function reverseGeoCode(lat, lng) {
    var address = "";
    $.ajax({
        url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat+","+lng,
        type: "POST",
        async : false,
        success: function(res) {
          if(res.results.length > 0) {
            address = res.results[0].formatted_address;
          }
        },
        error: function(responseText) {
            console.log(responseText);
        }
    });
    return address;
}
//End of common utility.
/****************************************************************************************************************************************************/
/** 1. Report an unsafe location. */
var currentPosition,report_map, autocomplete, geocoder;
var prevMarker, currentDT;
//Fallback location if geo is disabled.
var googleLocation = new google.maps.LatLng(37.421942, -122.08450);

/** Initialize the map. */
function initReport(lat, lng) {
    if (lat != undefined &&  lng != undefined) {
        //convert lat, long into LatLng object.
        currentPosition = new google.maps.LatLng(lat, lng);
        /** Create map params, to display zoom and travel mode. */
        var myOptions = {
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: currentPosition
        }
        //guard, from crashing in safari browser.
        if (report_map == undefined) {
            report_map = new google.maps.Map(document.getElementById("report-map-canvas"), myOptions);
        } else {
            report_map.setCenter(currentPosition);
        }
    } else {
        var myOptions = {
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        report_map = new google.maps.Map(document.getElementById("report-map-canvas"), myOptions);
        report_map.setCenter(googleLocation);
    }
    /** Auto pop-up of locations. */
    var reportLoc = new google.maps.places.Autocomplete(document.getElementById('reportLoc'),{ types: ['geocode'] });
    reportLoc.bindTo('bounds', report_map); 
    /** Events on map. */
    google.maps.event.addListener(report_map, 'click', function(event) {
        var marker = new google.maps.Marker({
            map: report_map,
            draggable: true,
            position: event.latLng,
        });
        initAndAddMarker(marker);
    });
    /** There are loading issue on iPhone to fix it we have set the timeout. */
    setTimeout(function() {
        google.maps.event.trigger(report_map, 'resize');
        initializeReport();
    }, 700);

    /** Registering the events. */
     $("#submit-button").off("click");
    $("#submit-button").on("click", function() {
        $("#repStatus").text("");
          if($("#reportLoc").val().trim().length === 0) {
             $("#repStatus").text("Missing location"); 
             $("#repStatus").css("color","red");
          }
          var revLatLng;
          geoCode($("#reportLoc").val(), function(latLng) {
            revLatLng = latLng;
        });
       
          var lati = revLatLng.split(",")[0];
          var lngi = revLatLng.split(",")[1];
          var pos = new google.maps.LatLng(lati, lngi);
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': pos}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results[1]) {
                report_map.setZoom(11);
                
                     var pushJson = '{"image_location":null,"incident_types":"'+$("#incidence").val()+'" ,'+
                        '"latitude":"'+lati+'", ' +
                         '"risk_index":'+null + ' ,"datetime":"'+currentDT+'",'+
                          '"description":"'+ $("#description").val() +'",'+
                           '"longitude":"'+lngi+'",'+
                            '"location":"'+results[1].formatted_address +'"}';
                    console.log(pushJson);
                 submitReport(pushJson);
               
              }  
            }  
          });
        
    }); //end of registration of events.
}

/**
* Submit a report.
*/            
function submitReport(json) {                
     $.ajax({
        url: '/v0/incidents',
        type: 'POST',
        data: json,
        contentType: "application/json;",
        success: function(response) {
            $("#repStatus").text("Submitted successfully");
             $("#repStatus").css("color","green");
            console.log("Submitted")
        },
         error: function(jqXHR, textStatus, errorThrown) {
             console.log(jqXHR.responseText);
            }
      });
}   

/**
* Initialize marker of the incident.
*/            
function initAndAddMarker(marker) {
    clearReportMarkers();
    prevMarker = marker;
}
            
/** Deletes any marker if present. */
function clearReportMarkers() {
    if (prevMarker != undefined) {
        prevMarker.setMap(null);
    }
}

/**  Initialize map for reporting. */
function initializeReport() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
            report_map.setCenter(pos);
        }, function() {
            report_map.setCenter(googleLocation);
        });
    } else {
        // Browser doesn't support Geolocation
        report_map.setCenter(googleLocation);
    }
    //auto complete for entering address.
    autocomplete = new google.maps.places.Autocomplete((document.getElementById('address-box')), {types: ['geocode']});
    // Register event.
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        dropPin();
    });
}


/** Drop a ping once the address is typed. */
function dropPin() {
    var address = document.getElementById('address-box').value;
    geocoder.geocode({'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            $("#reportLoc").attr("placeHolder", "Incident location ("+results[0].formatted_address+ " )");
            report_map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: report_map,
                draggable: true,
                position: results[0].geometry.location
            });
            initAndAddMarker(marker);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
        $('#address-box').val('');
    });
}

/**  Initializing report page. */
$('#report_form').live('pageinit', function() {
    currentDT = new Date().toString('yyyy/MM/dd HH:mm');
    $(".date-time-picker-class").datetimepicker({value: currentDT, mask: '9999/19/39 29:59', });
     navigator.geolocation.getCurrentPosition(locSuccessReport, locErrorReport);
});

/** Report page initilization. */
$('#report_page').live('pageinit', function() {
    navigator.geolocation.getCurrentPosition(locSuccessReport, locErrorReport);
});

/** Invoked if we encounter issue with report location finding. */
function locErrorReport(error) {
    $("#report-map-canvas").css({height: $("#report_page").height() / 1.6});
    initReport();
}
/** Invoked if we find location successfully. */
function locSuccessReport(position) {
    $("#report-map-canvas").css({height: $("#report_page").height() / 1.6});
    //let store this address as an incident unless user selects something else.
    initReport(position.coords.latitude, position.coords.longitude);               
}
/****************************************************************************************************************************************************/
/////////////////////////////////////Report code ends here.////////////////////////////////

//TODO: Need to use angular.js to modularize it.

/////////////////////////////////////Safe route code  starts here//////////////////////////
/****************************************************************************************************************************************************/

/** Initialize safe route page. */

var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();
var safeRouteLat, safeRouteLng, safeRouteMap;           
var prevCustomMap, startMarker, stopMarker, travelMode, tog = false;
var directionInstructions = [], distanceList =[], totDist = 0, totTime = 0;
var fastRouteIndex = 0; safeRouteIndex =0, incidenceCircle = [];
var listOfIncidence = [], markerCluster;

/** Initializing the safe route map before loaded. */
$('#safe_map').live('pageinit', function() {
    navigator.geolocation.getCurrentPosition(locSuccessSafeRoute, locErrorSafeRoute);
});

/** Executed before the pages are loaded. */
$(document).live("pagebeforeshow", "#map_page", function() {
    $("#saferoute_map_canvas").css({height: $("#safe_map").height() / 2});
    $("#report-map-canvas").css({height: $("#report_page").height() / 1.6});
});

/** Registering event for directions button. */
$(document).on('click', '#directions', function(e) {
    e.preventDefault();
    calculateRoute();
});

            
/** Initialize safe route. */
function initSafeRoute(lat, lng) {
     
    if (lat != undefined && lng != undefined) {
        //get the current position in latLng object.
        currentPosition = new google.maps.LatLng(lat, lng);
        /** options to initiliaze map. */
        var myOptions = {
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: currentPosition
        }
        //guard, from crashing in safari browser.
        if (safeRouteMap == undefined) {
            safeRouteMap = new google.maps.Map(document.getElementById("saferoute_map_canvas"), myOptions);
        } else {
            safeRouteMap.setCenter(currentPosition);
        }

        directionsDisplay.setMap(safeRouteMap);
        directionsDisplay.setPanel(document.getElementById("directions"));
        safeRouteLat = lat;
        safeRouteLng = lng;
    } else {
        var myOptions = { 
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        safeRouteMap = new google.maps.Map(document.getElementById("saferoute_map_canvas"), myOptions);
        safeRouteMap.setCenter(googleLocation);
        safeRouteLat = 37.421942;
        safeRouteLng = -122.08450;
    }
    //event to close the info window when u click on anywhere else on map.
    google.maps.event.addListener(safeRouteMap, 'click', function(event) {
        for (i in listOfIncidence) {
            if (listOfIncidence[i] != undefined) {
                listOfIncidence[i].close();
            }
        }
    });
    //fixing refresh issue on iphone or safari.
    setTimeout(function() {
        google.maps.event.trigger(safeRouteMap, 'resize');
    }, 700);
    var fromAddr = new google.maps.places.Autocomplete(document.getElementById('from'),{ types: ['geocode'] });
    var toAddr = new google.maps.places.Autocomplete(document.getElementById('to'),{ types: ['geocode'] });
    fromAddr.bindTo('bounds', safeRouteMap); 
    toAddr.bindTo('bounds', safeRouteMap);  
    google.maps.event.addListener(toAddr, 'place_changed', function() {
    calculateRoute();
  });

}

/** Invoked if we encounter issue with safe route location finding. */
function locErrorSafeRoute(error) {
    $("#from").attr("placeHolder", "Enter current location");
    $("#saferoute_map_canvas").css({height: $("#safe_map").height() / 2.0});
     initSafeRoute();
}

/** Invoked if we find location successfully. */
function locSuccessSafeRoute(position) {
    $("#from").attr("placeHolder", "Found current location");
    initSafeRoute(position.coords.latitude, position.coords.longitude);
    $("#saferoute_map_canvas").css({height: $("#safe_map").height() / 2.0});

}

/** highligh the travel modes on the top of the screen. */
function highLightTravelMode(travelMode) {
    $("#driving").css("border-bottom", "");
    $("#walking").css("border-bottom", "");
    $("#transit").css("border-bottom", "");
    $(travelMode).css("border-bottom", "4px solid blue");
}

/**
 * Facade method, to calculates path and plots the points on the map.
 * @param {type} data
 * @returns {undefined}
 */
function calculateRoute() {
    $("#invAddr").text("");
    var origin, destination;
    //select the travel mode and route type.
    if (travelMode == undefined) {
        travelMode = "driving";
    }
    //select the travel mode on the top.
    highLightTravelMode("#" + travelMode);
    //fetch the destination.
    var targetDestination = $("#to").val();
    if (currentPosition == null || currentPosition == '' || $("#from").val() != '') {
        currentPosition = $("#from").val();
        geoCode(currentPosition, function(latLng) {
            origin = latLng;
            plotSafeRoute(origin, targetDestination);

        });
    } else {
        origin = safeRouteLat + "," + safeRouteLng;
        plotSafeRoute(origin, targetDestination);
    }
}

/**
 * Reads lat, long and plots them on the map.
 * @returns {undefined}
 */
function plotSafeRoute(origin, targetDestination) {
    console.log("Travel mode chosen "+travelMode);
    
    geoCode(targetDestination, function(targetlatLng) {
        
        
        //Get the JSON messages by sending lat, lrng
       var route = "/directions?origin="+origin+"&destination="+targetlatLng+"&mode="+travelMode;
       
       $.mobile.showPageLoadingMsg();             
       $(".ui-loader-default").remove()
       
        $.get(route, function(mapData) {
          $.mobile.hidePageLoadingMsg(); 
          if(mapData.status !== "ZERO_RESULTS") {
            data = mapData;
            findShortDist(data);
            findSafeRoute(data);
            drawDataOnMap();
          } else {
            $("#invAddr").text("Invalid source or destination");
          }
        }, 'json');
     

    });
}

var data;

function drawDataOnMap() {
    if (prevCustomMap != undefined) {
        //erase previous map.
        prevCustomMap.setMap(null);
   }
  if(data != undefined) {

    clearIncidenceCir();
   
            var routeType = getRouteType();                        
            console.log("Route type chosen (safe or time) index "+routeType); 
            points = parseRoute(data, routeType);
            /** Map line display params. */
            var customPath = new google.maps.Polyline({
                path: points,
                geodesic: true,
                strokeColor: '#0000FF',
                strokeOpacity: 0.5,
                strokeWeight: 5
            });

            customPath.setMap(safeRouteMap);
            prevCustomMap = customPath;
            //Clearing markers if already exist.
            if (startMarker != undefined) {
                startMarker.setMap(null);
            }
            if (stopMarker != undefined) {
                stopMarker.setMap(null);
            }
            //creating stop marker.
            stopMarker = new google.maps.Marker({
                position: points[points.length - 1],
                map: safeRouteMap,
                icon: 'http://maps.gstatic.com/mapfiles/markers2/marker_greenB.png'
            });
            //creating start marker.
            startMarker = new google.maps.Marker({
                position: points[0],
                map: safeRouteMap,
                icon: 'http://maps.gstatic.com/mapfiles/markers2/marker_greenA.png'
            });
            //Defining the area to fit the route exactly on the map.
            var endBound = new google.maps.LatLng(data.routes[routeType].bounds.northeast.lat,
                    data.routes[routeType].bounds.northeast.lng);
            var startBound = new google.maps.LatLng(data.routes[routeType].bounds.southwest.lat,
                    data.routes[routeType].bounds.southwest.lng);
            var bnds = new google.maps.LatLngBounds(startBound, endBound);
            safeRouteMap.fitBounds(bnds);
           //plotting directions.
           var completeRouteInstructions = '<br><table data-role="table" id="my-table" data-mode="reflow">'; 
           completeRouteInstructions += '<tr  style="background-color:#e79952"> <th colspan="2"> Directions </th> </tr>';
           for(inst in directionInstructions) {
              var tmp = parseInt(inst) + 1;
             completeRouteInstructions += ('<tr> <td class="ui-li ui-li-static ui-body-d"> '+tmp+". "+directionInstructions[inst]+'</td><td width="45" class="ui-li-static ui-body-d">'+distanceList[inst]+'</td></tr>');
           }
           completeRouteInstructions += '</table>';
           $("#routeDirections").html(completeRouteInstructions);
           $("#showTimeDis").show();
           //$("#saferoute_map_canvas").css({height: $("#safe_map").height() / 2.2});
  }
}
        
/** Toggle the panel of travel modes. */    
function togglePlanPanel() {
    if (!tog) {
        $("#planPanel").slideDown();
        $("#showspace").slideDown();
    } else {
        $("#planPanel").slideUp();
        $("#showspace").slideUp();
    }
    tog = !tog;
}
            
/**
 * Parse the route.
 * @param {type} encoded
 * @returns {Array|decodeLine.array}
 */
function parseRoute(data, routeType) {
    directionInstructions= [];
    distanceList= [];  
    var points = [],
    routes = data.routes;
   console.log("Total routes "+routes.length);
    jLegs = routes[routeType].legs
    /** Traversing all legs */
    for (j in jLegs) {
        jSteps = jLegs[j].steps;
        /** Traversing all steps */
        for (k in jSteps) {
            totDist += jSteps[k].distance.value;
            totTime += jSteps[k].duration.value;
            polyline = jSteps[k].polyline.points;
            directionInstructions.push(jSteps[k].html_instructions);
            distanceList.push(jSteps[k].distance.text);
            list = decodeLine(polyline);
            /** Traversing all points */
            for (l in list) {
                points.push(new google.maps.LatLng(list[l].latitude, list[l].longitude));
            }
        }
        totDist = Math.round(totDist/1000);
        totTime = Math.round(totTime/60);
        console.log("Total distance " + (totDist) + " km");
        console.log("Total time "+ (totTime) + " min");
        $("#travelTime").text("Travel time: "+totTime+" minutes");
        $("#travelDist").text("Distance: "+totDist + " km");
    }
    
    if (document.getElementById("unsafeRoute").value === "on") {
        plotIncidence(data, routeType);
    }

    return points;
}

/**
* Find the shortes distance on the map.
*/          
function findShortDist(data) {
    var distArray = [];
    var routes = data.routes;
    for (i in data.routes) {
        leg = routes[i].legs;
        dist = 0;
        for (j in leg) {
            steps_1 = leg[j].steps;
            for (k in steps_1) {
                dist += steps_1[k].duration.value;
            }
        }
        distArray.push(dist);
    }
    //Using javascript mathematical function to find min of list of calculated time.
    fastRouteIndex = distArray.indexOf(Math.min.apply(null, distArray));
    console.log("Fast route time " + Math.min.apply(null, distArray));
    console.log("Fast route index " + fastRouteIndex);
}

/** Find the safest route on the map. */         
function findSafeRoute(data) {
    var safeArray = [];
    var risks = data.risks;
    for (i in risks) {
        safeArray.push(risks[i].total_risk);
    }
    //Using javascript mathematical function to find the min of list of risks.
    safeRouteIndex = safeArray.indexOf(Math.min.apply(null, safeArray));
    console.log("Safe route time " + Math.min.apply(null, safeArray));
    console.log("Safe route index " + safeRouteIndex);
}

/** Clear incidence circles. */
function clearIncidenceCir() {
    for (k in incidenceCircle) {
        incidenceCircle[k].setMap(null);
    }
     if(markerCluster != undefined) {
       markerCluster.clearMarkers();
    }
}

var markers ;
var riskBrk;
 /** Plot the incidents on the map. */           
function plotIncidence(data, index) {
    
    markers = [];
    riskBrk = data.risks[index].risk_breakdown;
    for (i in riskBrk) {
    //populate array if there are risks.
        if (riskBrk[i].risk > 0) {
            var showIncidence;
            var event = new google.maps.LatLng(riskBrk[i].lat, riskBrk[i].lng);
            //== Adding clusters start
            var marker1 = new google.maps.Marker({
                position: event
              });
              markers.push(marker1);


            var format = "<table>"
            //create info window, only if the incidents are defined.
            if (data.risks[index].risk_incidents[i].incidents[0] != undefined) {
                var when = new Date(data.risks[index].risk_incidents[i].incidents[0].incident_time * 1000);
                var reported = new Date(data.risks[index].risk_incidents[i].incidents[0].created_at * 1000);
                showIncidence = new google.maps.InfoWindow({
                    content: format + "<tr><td>Incident type</td><td>" + data.risks[index].risk_incidents[i].incidents[0].title + "</td></tr>" +
                            "<tr><td>Occurred on </td><td>" + when.getDate() + "/" + (when.getMonth() + 1) + "/" + when.getFullYear() + "(DD/MM/YYYY)</td></tr>" +
                            "<tr><td style='width:130px' >Reported on </td><td>" + reported.getDate() + "/" + (reported.getMonth() + 1) + "/" + reported.getFullYear() + "(DD/MM/YYYY)</td></tr></table>",
                    maxWidth: 400,
                    maxHeight: 300
                });                                                 
                addIncidentPoints(marker1, showIncidence);
            } else {
                showIncidence = new google.maps.InfoWindow({
                    content: "No data available",
                    maxWidth: 200
                });                               
                addIncidentPoints(marker1, showIncidence);
            }
            listOfIncidence.push(showIncidence);
        }
    }
    //marker icon as red.
    plotClusterOnMap()
    
}

function plotClusterOnMap() {
    var mcOptions = {styles: [{
        height: 53,
        url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m3.png",
        width: 53
        }]};
    markerCluster = new MarkerClusterer(safeRouteMap, markers, mcOptions);
    if(riskBrk != undefined) {
      $("#numIncidents").text("Incidents reported: "+riskBrk.length);
      console.log("Number of incidence " + riskBrk.length);
    }
}
/**
* Add incident point with details window.
*/        
 function addIncidentPoints(marker, infoWindow) {

    //add a click event to the circle
    google.maps.event.addListener(marker, 'click', function(ev) {
        //call  the infoWindow
        infoWindow.setPosition(ev.latLng);
        infoWindow.open(safeRouteMap);
    });
    
}

/**
 * Decode the path.
 * @param {type} encoded
 * @returns {Array|decodeLine.array}
 */
function decodeLine(encoded) {
    var len = encoded.length;
    var index = 0;
    var array = [];
    var lat = 0;
    var lng = 0;

    while (index < len) {
        var b;
        var shift = 0;
        var result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        array.push({longitude: lng * 1e-5, latitude: lat * 1e-5});
    }

    return array;
}

/** User selecting the travel will trigger this function. */
function selectTravelMode(mode) {
    togglePlanPanel();
    travelMode = mode;
    calculateRoute();
}

/** This function will decide the route type i.e., safest or fastest. */
function getRouteType() {
  var routeType;
     if (document.getElementById("routeType").value === "safe") {
        routeType = fastRouteIndex;
     } else {
        routeType = safeRouteIndex;
     }
  return routeType;
}

/** Shwo unsafe route. */
function showUnsafeRoute() {
    if (document.getElementById("unsafeRoute").value === "on") {
        plotClusterOnMap()
    } else {
        clearIncidenceCir();
    }

}
            
            
