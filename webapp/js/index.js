/**
 * Webapp frontend JS.
 */

$(document).ready(function() {

    var mobileDemo = {'center': '57.7973333,12.0502107', 'zoom': 10};
    var currentPosition;
    //Fallback location if geo is disabled.
    var googleLocation = new google.maps.LatLng(37.421942, -122.08450);
    //Canvas for rendering Google Maps
    var repor_map;
    //Map to save the time stamps of various events
    var timeMap;
    //Map to save incidences corresponding to  various events
    var incidenceMap;
    //List of all the markers.
    var markers = [];
    //Count of incidences to report in single submit
    var markerCount;
    //Pieces forming the infobox's inner HTML
    var contentStringPart1 = '<div id="infobox-';
    //Preferable to add a global init method for fetching all the enums from the server.
    var contentStringPart2 = '">' +
            '<div>Select Date and Time: <input class="date-time-picker-class"/></div>' +
            '<div><label>Select incidence:</label><br>' +
            '<input type="checkbox" class="incidence-class" name="incidence" value="1"/><label>Whistling</label>' +
            '<input type="checkbox" class="incidence-class" name="incidence" value="2"/><label>Eve teasing</label>' +
            '<input type="checkbox" class="incidence-class" name="incidence" value="4"/><label>Molestation</label><br>' +
            '<input type="checkbox" class="incidence-class" name="incidence" value="3"/><label>Chain snatching</label>' +
            
            '<input type="checkbox" class="incidence-class" name="incidence" value="5"/><label>Rape</label>' +
            '</div></div>';
    var autocomplete, geocoder;
    function geoCode(address, callBack) {
        var latLong = "";
        $.ajax({
            url: "http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=false",
            type: "POST",
            success: function(res) {
                latLong = res.results[0].geometry.location.lat + "," + res.results[0].geometry.location.lng;
                callBack(latLong);
            },
            error: function(responseText) {
                console.log(responseText);
            }
        });
        return latLong;
    }

    function initReport(lat, lng) {
        markerCount = 0;
        timeMap = new Object();
        incidenceMap = new Object();
        currentPosition = new google.maps.LatLng(lat, lng);

        var myOptions = {
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: currentPosition
        }
        //guard, from crashing in safari browser.
        if (typeof repor_map == 'undefined') {
            repor_map = new google.maps.Map(document.getElementById("report-map-canvas"), myOptions);
        } else {
            repor_map.setCenter(currentPosition);
        }

       
      
        //google.maps.event.addDomListener(window, 'load', reportInitialize);
        google.maps.event.addListener(repor_map, 'click', function(event) {
            var marker = new google.maps.Marker({
                map: repor_map,
                draggable: true,
                position: event.latLng,
            });
            initAndAddMarker(marker);
        });
         setTimeout(function() {
            google.maps.event.trigger(repor_map, 'resize');
            reportInitialize();
        }, 700);
        $("#submit-button").click(function() {
            var pushJson = '';
            for (var index in markers) {
                var marker = markers[index];
                var valIncidences = '';
                markerId = marker.index;
                if (markerId in incidenceMap) {
                    var incidences = incidenceMap[markerId];
                    for (incidence in incidences) {
                        valIncidences += incidence + ",";
                    }
                }
                var coordinates = marker.getPosition();
                pushJson += "{"
                        + "incidence:{lat:" + coordinates.lat().toString() + ",lng:" + coordinates.lng().toString() + "},"
                        + "datetime:" + timeMap[markerId] + ","
                        + "incidences:" + valIncidences
                        + "},";
            }
            alert(pushJson);
        });
    }

    function initAndAddMarker(marker) {
        var markerId = markerCount;
        var infowindow = new google.maps.InfoWindow({
            content: contentStringPart1 + markerId.toString() + contentStringPart2
        });
        google.maps.event.addListener(infowindow, 'closeclick', function() {
            timeMap[markerId.toString()] = $("#infobox-" + markerId + " .date-time-picker-class").datetimepicker('getDateTime').val().toString();
            var incidences = new Array();
            var count = 0;
            $("#infobox-" + markerId + " :checkbox:checked").each(function(i) {
                incidences[count++] = $(this).val();
            });
            incidenceMap[markerId.toString()] = incidences;
        });
        google.maps.event.addListener(marker, 'dblclick', function() {
            var newMarkers = {};
            for (index in markers) {
                if (markers[index].index != marker.index) {
                    newMarkers.push(markers[index]);
                }
            }
            markers = newMarkers;
            marker.setMap(null);
        });
       
        google.maps.event.addListener(marker, 'click', function(event) {
            infowindow.open(repor_map, marker);
            $(".date-time-picker-class").datetimepicker({mask: '9999/19/39 29:59', });
            if (markerId in timeMap) {
                $("#infobox-" + markerId + " .date-time-picker-class").datetimepicker({value: timeMap[markerId], mask: '9999/19/39 29:59', });
            } else {
                var currentDT = new Date().toString('yyyy/MM/dd HH:mm');
                $("#infobox-" + markerId + " .date-time-picker-class").datetimepicker({value: currentDT, mask: '9999/19/39 29:59', });
            }
            if (markerId in incidenceMap) {
                var incidences = incidenceMap[markerId];
                $('input[type=checkbox]').each(function(i) {
                    if (incidences.indexOf($(this).val()) > -1) {
                        $(this).prop('checked', true);
                    }
                });
            }
        });

        marker.index = markerCount;
        markers.push(marker);
        markerCount++;
    };
    
    function clearReportMarkers() {
        for (index in markers) {
            markers[index].setMap(null);
       }  
    }

    function reportInitialize() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = new google.maps.LatLng(position.coords.latitude,
                        position.coords.longitude);
                renderMap(pos);
            }, function() {
                renderMap(googleLocation);
            });
        } else {
            // Browser doesn't support Geolocation
            renderMap(googleLocation);
        }
        initCanvas();
    }

    function renderMap(pos) {
        repor_map.setCenter(pos);
    }

    function initCanvas() {  
        autocomplete = new google.maps.places.Autocomplete((document.getElementById('address-box')), {types: ['geocode']});
        google.maps.event.addListener(autocomplete, 'place_changed', function() { 
            dropPin();
        });
    }

    function geolocate() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geolocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                autocomplete.setBounds(new google.maps.LatLngBounds(geolocation, geolocation));
            });
        }
        geocoder = new google.maps.Geocoder();
    }

    function dropPin() {
        var address = document.getElementById('address-box').value;
        geocoder.geocode({'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                repor_map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: repor_map,
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
    $('#report_page').live('pageinit', function() {
        navigator.geolocation.getCurrentPosition(locSuccess, locError);
    //                demo.add('report_page', function() {
    //                    $('#report-map-canvas').gmap({'center': mobileDemo.center, 'zoom': mobileDemo.zoom, 'disableDefaultUI': true, 'callback': function() {
    //                         initReport(57.7973333,12.0502107);
    //                        // $("#report-map-canvas").css("display","flex")
    //                        }});
    //                }).load('report_page');
    });
    /////////////////////////////////////Report code ends here.////////////////////////////////

    //TODO: Need to integrate both the codes efficiently.

    /////////////////////////////////////Safe route code  starts here//////////////////////////

    $('#basic_map').live('pageinit', function() {
        navigator.geolocation.getCurrentPosition(locSuccess, locError);
        $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.102});
    //                $("#report-map-canvas").css({height: $("#report_page").height() / 2.102});
    //                demo.add('basic_map', function() {
    //                    $('#saferoute_map_canvas').gmap({'center': mobileDemo.center, 'zoom': mobileDemo.zoom, 'disableDefaultUI': true, 'callback': function() {
    //                          initSafeRoute();
    //                        }});
    //                }).load('basic_map');
    });

    $(document).live("pagebeforeshow", "#map_page", function() {
        $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.102});
    //                navigator.geolocation.getCurrentPosition(locSuccess, locError);
    //                $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.102});
    //                
        $("#report-map-canvas").css({height: $("#report_page").height() / 2.102});

    });

    $(document).on('click', '#submit', function(e) {
        e.preventDefault();
        calculateRoute();
    });

    var directionDisplay,
            directionsService = new google.maps.DirectionsService(),
            map;

    function initSafeRoute(lat, lng) {
        directionsDisplay = new google.maps.DirectionsRenderer();
        //var mapCenter = new google.maps.LatLng(59.3426606750, 18.0736160278);
        currentPosition = new google.maps.LatLng(lat, lng);
        var myOptions = {
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: currentPosition
        }
        //guard, from crashing in safari browser.
        if (typeof map == 'undefined') {
            map = new google.maps.Map(document.getElementById("saferoute_map_canvas"), myOptions);
        } else {
            map.setCenter(currentPosition);
        }
        setTimeout(function() {
            google.maps.event.trigger(map, 'resize');
        }, 700);
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById("directions"));
        var currentPositionMarker = new google.maps.Marker({
            position: currentPosition,
            map: map,
            title: "Current position"
        });
        new google.maps.places.Autocomplete(document.getElementById('from'));

        new google.maps.places.Autocomplete(document.getElementById('to'));

        var infowindow = new google.maps.InfoWindow();
        google.maps.event.addListener(currentPositionMarker, 'click', function() {
            infowindow.setContent("Current position: latitude: " + lat + " longitude: " + lng);
            infowindow.open(map, currentPositionMarker);
        });

    }

    function locError(error) {
        $("#from").attr("placeHolder", "Enter current location");
        $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.102});
        $("#report-map-canvas").css({height: $("#report_page").height() / 2.102});
        initSafeRoute(position.coords.latitude, position.coords.longitude);
        initReport(position.coords.latitude, position.coords.longitude);
    }
    var safeRouteLat, safeRouteLng;
    function locSuccess(position) {
        $("#from").attr("placeHolder", "Found current location");
        safeRouteLat = position.coords.latitude;
        safeRouteLng = position.coords.longitude;
        initSafeRoute(position.coords.latitude, position.coords.longitude);
        $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.102});
        $("#report-map-canvas").css({height: $("#report_page").height() / 2.102});
        initReport(position.coords.latitude, position.coords.longitude);

    }
    function highLightTravelMode(travelMode) {

        $("#DRIVING").css("border-bottom", "");
        $("#WALKING").css("border-bottom", "");
        $("#TRANSIT").css("border-bottom", "");
        $("#BICYCLING").css("border-bottom", "");
        $(travelMode).css("border-bottom", "4px solid blue");

    }

    /**
     * Facade method, to calculates path and plots the points on the map.
     * @param {type} data
     * @returns {undefined}
     */
    function calculateRoute(travelMode,routeType) {
        var origin, destination;
        if (typeof travelMode == 'undefined') {
            travelMode = "DRIVING";
        }
        if(typeof routeType == 'undefined') {
            routeType = 0;
        }
        highLightTravelMode("#" + travelMode);
        var targetDestination = $("#to").val();
        if (currentPosition == null || currentPosition == '' || $("#from").val() != '') {
            currentPosition = $("#from").val();
            geoCode(currentPosition, function(latLng) {
                origin = latLng;
                plotSafeRoute(origin, targetDestination, routeType);

            });
        } else {
            origin = safeRouteLat + "," + safeRouteLng;
            plotSafeRoute(origin, targetDestination, routeType);
        }




    }

     /**
      * Reads lat, long and plots them on the map.
      * @returns {undefined}
      */
    var prevCustomMap, startMarker, stopMarker;
    function plotSafeRoute(origin, targetDestination, routeType) {
        geoCode(targetDestination, function(latLng) {
            destination = latLng;
            
            if(typeof prevCustomMap != 'undefined') {
                     //erase previous map.
                     prevCustomMap.setMap(null);
                } 
            //alert("http://23.253.74.155/directions?origin="+origin+"&destination="+destination);
            //Get the JSON messages by sending lat, lng
            // var route = "http://23.253.74.155/directions?origin="+origin+"&destination="+destination;
            $.get('testSafeRoute.json', function(data) {
                points = parseRoute(data, routeType); 
                
               var customPath = new google.maps.Polyline({
                    path: points,
                    geodesic: true,
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.5,
                    strokeWeight: 5
                });
                 
                customPath.setMap(map);
                prevCustomMap = customPath;
                //set the zoom level, after plotting.
                var nw = new google.maps.LatLng(data.routes[routeType].bounds.northeast.lat, 
                data.routes[routeType].bounds.northeast.lng);
                if(typeof startMarker != 'undefined') {
                    startMarker.setMap(null);
                }
                if(typeof stopMarker != 'undefined') {
                    stopMarker.setMap(null);
                }
                stopMarker = new google.maps.Marker({
                    position: nw,
                    map: map,
                    icon : 'http://maps.gstatic.com/mapfiles/markers2/marker_greenB.png'
                });
                var sw = new google.maps.LatLng(data.routes[routeType].bounds.southwest.lat, 
                data.routes[routeType].bounds.southwest.lng);
                startMarker = new google.maps.Marker({
                    position: sw,
                    map: map,
                    icon : 'http://maps.gstatic.com/mapfiles/markers2/marker_greenA.png'
                });
                var bnds = new google.maps.LatLngBounds(sw,nw);
                map.fitBounds(bnds);
                
            }, 'json');


             //                   if (currentPosition && currentPosition != '' && targetDestination && targetDestination != '') {
             //                        $.ajax({
             //                               url: 'http://127.0.0.1:7001/mbeans/rest/configure/route',
             //                               type: 'GET',
             //                               contentType: "application/json;",
             //                               success: function(response) {
             //                                    directionsDisplay.setPanel(document.getElementById("directions"));
             //                                    var test = response.data;
                                                   
             //                                    var act = JSON.parse(test);
             //                                    points = parseRoute(act);
                                            
             // var customPath = new google.maps.Polyline({
             //     path: points,
             //     geodesic: true,
             //     strokeColor: '#0000FF',
             //     strokeOpacity: 0.5,
             //     strokeWeight: 4
             //   });
    
             //   customPath.setMap(map);
    
             //                                           directionsDisplay.setPanel(document.getElementById("directions"));
             //                                           directionsDisplay.setDirections(act);
    
             //                               },
             //                               error: function(jqXHR, textStatus, errorThrown) {                                            
             //                                   console.log(jqXHR.responseText);
             //                               }
             //                           });
    
    
             //                   }
             //                   else {
             //                       $("#results").hide();
             //                   }
        });
    }
    var tog = false;
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
        
        var totDist = 0;
        var points = [],
        routes = data.routes;
     //   for (i in routes) {
            //jLegs = routes[i].legs
            console.log("Route type"+routeType);
            jLegs = routes[routeType].legs
            /** Traversing all legs */
            for (j in jLegs) {
                jSteps = jLegs[j].steps;
                /** Traversing all steps */
                for (k in jSteps) {
                    totDist += jSteps[k].duration.value;
                    polyline = jSteps[k].polyline.points;
                    list = decodeLine(polyline);
                    /** Traversing all points */
                    for (l in list) {
                        points.push(new google.maps.LatLng(list[l].latitude, list[l].longitude));
                    }
                }
                  console.log("Distance "+totDist);
            }
      //  }
       findShortDist(data);
       findSafeRoute(data);
       if(document.getElementById("unsafeRoute").value === "on") {
         plotIncidence(data, routeType);
       }
       
        return points;
    }
    var fastRouteIndex = 0;
    function findShortDist(data) {
        var distArray = []; 
        var routes = data.routes;
        for(i in data.routes) {
            leg = routes[i].legs;
            dist = 0;
            for(j in leg) {
               steps_1 = leg[j].steps;
               for(k in steps_1) {
                 dist += steps_1[k].duration.value;
               }
            }
            distArray.push(dist);
        }
        fastRouteIndex = distArray.indexOf(Math.min.apply(null, distArray));
        console.log("Fast route time "+Math.min.apply(null, distArray));
        console.log("Fast route index "+fastRouteIndex);
    }
    var safeRouteIndex = 0;
    function findSafeRoute(data) {
        var safeArray = [];
        var risks = data.risks;
        for(i in risks) {
            safeArray.push(risks[i].total_risk);
        }
        safeRouteIndex = safeArray.indexOf(Math.min.apply(null, safeArray));
        console.log("Safe route risk "+Math.min.apply(null, safeArray));
        console.log("Safe route index "+safeRouteIndex);
    }
    var incidenceCircle = [];
    function clearIncidenceCir() {
        for(k in incidenceCircle) {
            incidenceCircle[k].setMap(null);
        } 
    }
    function plotIncidence(data, index) {
        clearIncidenceCir();
        var incidence = [];                
        var riskBrk = data.risks[index].risk_breakdown;
        for(i in riskBrk) {
            //populate array if there are risks.
            if(riskBrk[i].risk > 0) {                      
             incidence.push(new google.maps.LatLng(riskBrk[i].lat, riskBrk[i].lng));
           }
        }
      console.log("Number of incidence "+incidence.length);
      for(j in incidence) {
         var incidenceCirclePlots = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            clickable : true,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,  
            center: incidence[j],
            radius: 50
          };
          //create circle object..
          var circ = new google.maps.Circle(incidenceCirclePlots);
          var infoWindow;
          var format = "<table>"
          //create info window, only if the incidents are defined.
          if(typeof data.risks[index].risk_incidents[j].incidents[0] != 'undefined') {
            infoWindow= new google.maps.InfoWindow({
                content: format+"<tr><td>What happened ?</td><td>"+data.risks[index].risk_incidents[j].incidents[0].title+"</td></tr>"+
                         "<tr><td>When ? </td><td>"+data.risks[index].risk_incidents[j].incidents[0].incident_time+"</td></tr>"+
                         "<tr><td style='width:130px' >Reported on ? </td><td>"+data.risks[index].risk_incidents[j].incidents[0].created_at+"</td></tr></table>",
                maxWidth : 400,
                maxHeight: 300
                });
               addCir(circ, infoWindow);
            } else {
              infoWindow= new google.maps.InfoWindow({
                content: "No data available",
                maxWidth : 200
                }); 
                addCir(circ, infoWindow);
            }
           
          
      }
    }

    function addCir(circ, infoWindow) {
         //add a click event to the circle
            google.maps.event.addListener(circ, 'click', function(ev){
            //call  the infoWindow
                infoWindow.setPosition(ev.latLng);
                infoWindow.open(map);
            }); 
            incidenceCircle.push(circ);
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

    function changeRouteType() {
       if(document.getElementById("routeType").value === "safe") {
           console.log("Safe");
          calculateRoute('DRIVING',safeRouteIndex);
       } else {
           console.log("Time");
           calculateRoute('DRIVING', fastRouteIndex);
       }
       
    }

    function showUnsafeRoute() {
       if(document.getElementById("unsafeRoute").value === "on") {
          changeRouteType();
       } else {
          clearIncidenceCir();
       }
       
    }

});