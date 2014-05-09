/**
 * Webapp frontend JS.
 */

     var mobileDemo = {'center': '57.7973333,12.0502107', 'zoom': 10};
            var currentPosition;
            //Fallback location if geo is disabled.
            var googleLocation = new google.maps.LatLng(37.421942, -122.08450);
            //Canvas for rendering Google Maps
            var repor_map;
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
                if (typeof lat != 'undefined' && typeof lng != 'undefined') {
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
                } else {
                    var myOptions = {
                        zoom: 17,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    }
                    repor_map = new google.maps.Map(document.getElementById("report-map-canvas"), myOptions);
                    repor_map.setCenter(googleLocation);
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
                   
                    var coordinates = prevMarker.getPosition();
                    geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'latLng': prevMarker.getPosition()}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                          if (results[1]) {
                            repor_map.setZoom(11);
                            marker = new google.maps.Marker({
                                position: prevMarker.getPosition(),
                                map: repor_map
                            }); 
                                  var pushJson = '{"image_location":null,"incident_types":"'+$('input[name="incidence"]:checked').val()+'" ,'+
                                    '"latitude":"'+prevMarker.getPosition().lat().toString() +'", ' +
                                     '"risk_index":'+null + ' ,"datetime":"'+currentDT+'",'+
                                      '"description":"'+ $("#description").val() +'",'+
                                       '"longitude":"'+prevMarker.getPosition().lng().toString()+'",'+
                                        '"location":"'+results[1].formatted_address +'"}';

                              submitReport(pushJson);
                          }  
                        }  
                      });
                    
                });
            }
            function submitReport(json) {                
                 $.ajax({
                    url: '/v0/incidents',
                    type: 'POST',
                    data: json,
                    dataType: "json;",
                    success: function(response) {
                        $("#repStatus").text("Submitted successfully");
                        console.log("Submitted")
                    },
                     error: function(jqXHR, textStatus, errorThrown) {
                         console.log(jqXHR.responseText);
                        }
                  });
            }   
            var prevMarker;
            var currentDT;
            function initAndAddMarker(marker) {
                clearReportMarkers();
                prevMarker = marker;
                google.maps.event.addListener(marker, 'click', function(event) {
                    currentDT = new Date().toString('yyyy/MM/dd HH:mm');
                    $(".date-time-picker-class").datetimepicker({value: currentDT, mask: '9999/19/39 29:59', });
                    location.href = '#report_form';
                });
            }
            ;

            function clearReportMarkers() {
                if (typeof prevMarker != 'undefined') {
                    prevMarker.setMap(null);
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
                navigator.geolocation.getCurrentPosition(locSuccessReport, locErrorReport);
           });
            /////////////////////////////////////Report code ends here.////////////////////////////////

            //TODO: Need to integrate both the codes efficiently.

            /////////////////////////////////////Safe route code  starts here//////////////////////////

             $('#basic_map').live('pageinit', function() {
                navigator.geolocation.getCurrentPosition(locSuccessSafeRoute, locErrorSafeRoute);
            });

            $(document).live("pagebeforeshow", "#map_page", function() {
                $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.102});
                $("#report-map-canvas").css({height: $("#report_page").height() / 1.6});

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
                if (typeof lat != 'undefined' && typeof lng != 'undefined') {
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

                    directionsDisplay.setMap(map);
                    directionsDisplay.setPanel(document.getElementById("directions"));
                    var currentPositionMarker = new google.maps.Marker({
                        position: currentPosition,
                        map: map,
                        title: "Current position"
                    });
//                     var infowindow = new google.maps.InfoWindow();
//                    google.maps.event.addListener(currentPositionMarker, 'click', function() {
//                        infowindow.setContent("Current position: latitude: " + lat + " longitude: " + lng);
//                        infowindow.open(map, currentPositionMarker);
//                    });
                    safeRouteLat = lat;
                    safeRouteLng = lng;
                } else {
                    var myOptions = {
                        zoom: 17,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    }
                    map = new google.maps.Map(document.getElementById("saferoute_map_canvas"), myOptions);
                    map.setCenter(googleLocation);
                    safeRouteLat = 37.421942;
                    safeRouteLng = -122.08450;
                }
                //event to close the info window when u click on anywhere else on map.
                google.maps.event.addListener(map, 'click', function(event) {
                    for (i in listOfIncidence) {
                        if (typeof listOfIncidence[i] != 'undefined') {
                            listOfIncidence[i].close();
                        }
                    }
                });
                setTimeout(function() {
                    google.maps.event.trigger(map, 'resize');
                }, 700);
                new google.maps.places.Autocomplete(document.getElementById('from'));
                new google.maps.places.Autocomplete(document.getElementById('to'));

            }

            function locError(error) {
                $("#from").attr("placeHolder", "Enter current location");
                $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.1});
                $("#report-map-canvas").css({height: $("#report_page").height() / 1.6});
                initSafeRoute();
                initReport();
            }
            var safeRouteLat, safeRouteLng;
            function locErrorSafeRoute(error) {
                $("#from").attr("placeHolder", "Enter current location");
                $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.1});
                 initReport();
            }
            var safeRouteLat, safeRouteLng;
            function locSuccessSafeRoute(position) {
                $("#from").attr("placeHolder", "Found current location");
                initSafeRoute(position.coords.latitude, position.coords.longitude);
                $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.1});
            
            }
            function locErrorReport(error) {
                $("#report-map-canvas").css({height: $("#report_page").height() / 1.6});
                initReport();
            }
            var safeRouteLat, safeRouteLng;
            function locSuccessReport(position) {
                $("#report-map-canvas").css({height: $("#report_page").height() / 1.6});
                initReport(position.coords.latitude, position.coords.longitude);

            }

            /**
             * Facade method, to calculates path and plots the points on the map.
             * @param {type} data
             * @returns {undefined}
             */
            function calculateRoute() {
                var origin, destination;
                //select the travel mode and route type.
                if (typeof travelMode == 'undefined') {
                    travelMode = "driving";
                }
                if (typeof routeType == 'object') {
                    if (document.getElementById("routeType").value === "safe") {
                        routeType = safeRouteIndex;
                    } else {
                        routeType = fastRouteIndex;
                    }
                    console.log("Travel mode chosen "+travelMode);
                    console.log("Route type chosen "+routeType);
                    //routeType = 0;
                }
                //select the travel mode on the top.
                highLightTravelMode("#" + travelMode);
                //fetch the destination.
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
            var prevCustomMap, startMarker, stopMarker, travelMode;
            function plotSafeRoute(origin, targetDestination, routeType) {
                geoCode(targetDestination, function(targetlatLng) {
                    
                    if (typeof prevCustomMap != 'undefined') {
                        //erase previous map.
                        prevCustomMap.setMap(null);
                    }
                    //Get the JSON messages by sending lat, lng
                     var route = "/directions?origin="+origin+"&destination="+targetlatLng+"&mode="+travelMode;
                    $.get(route, function(data) {
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
                        if (typeof startMarker != 'undefined') {
                            startMarker.setMap(null);
                        }
                        if (typeof stopMarker != 'undefined') {
                            stopMarker.setMap(null);
                        }
                        stopMarker = new google.maps.Marker({
                            position: points[points.length - 1],
                            map: map,
                            icon: 'http://maps.gstatic.com/mapfiles/markers2/marker_greenB.png'
                        });
                        startMarker = new google.maps.Marker({
                            position: points[0],
                            map: map,
                            icon: 'http://maps.gstatic.com/mapfiles/markers2/marker_greenA.png'
                        });
                        var endBound = new google.maps.LatLng(data.routes[routeType].bounds.northeast.lat,
                                data.routes[routeType].bounds.northeast.lng);
                        var startBound = new google.maps.LatLng(data.routes[routeType].bounds.southwest.lat,
                                data.routes[routeType].bounds.southwest.lng);
                        var bnds = new google.maps.LatLngBounds(startBound, endBound);
                        map.fitBounds(bnds);

                    }, 'json');


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
//                   for (i in routes) {
                    
//                jLegs = routes[i].legs
                console.log("Total routes "+routes.length);
                console.log("Route type" + routeType);
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
                    console.log("Distance " + totDist);
                }
//                  }
                findShortDist(data);
                findSafeRoute(data);
                if (document.getElementById("unsafeRoute").value === "on") {
                    plotIncidence(data, routeType);
                }

                return points;
            }
            var fastRouteIndex = 0;
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

                fastRouteIndex = distArray.indexOf(Math.min.apply(null, distArray));
                console.log("Fast route time " + Math.min.apply(null, distArray));
                console.log("Fast route index " + fastRouteIndex);
            }
            var safeRouteIndex = 0;
            function findSafeRoute(data) {
                var safeArray = [];
                var risks = data.risks;
                for (i in risks) {
                    safeArray.push(risks[i].total_risk);
                }

                safeRouteIndex = safeArray.indexOf(Math.min.apply(null, safeArray));
                
                console.log("Safe route index " + safeRouteIndex);
            }
            var incidenceCircle = [];
            function clearIncidenceCir() {
                for (k in incidenceCircle) {
                    incidenceCircle[k].setMap(null);
                }
            }


            var listOfIncidence = [];
            function plotIncidence(data, index) {
                clearIncidenceCir();
                var incidence = [];
                var riskBrk = data.risks[index].risk_breakdown;
                for (i in riskBrk) {
                    //populate array if there are risks.
                    if (riskBrk[i].risk > 0) {
                        var showIncidence;
                        var event = new google.maps.LatLng(riskBrk[i].lat, riskBrk[i].lng);
                        incidence.push(event);
                        var incidenceCirclePlots = {
                            strokeColor: '#FF0000',
                            strokeOpacity: 0.8,
                            clickable: true,
                            strokeWeight: 2,
                            fillColor: '#FF0000',
                            fillOpacity: 0.35,
                            map: map,
                            center: event,
                            radius: 50
                        };
                        //create circle object..
                        var circ = new google.maps.Circle(incidenceCirclePlots);

                        var format = "<table>"
                        //create info window, only if the incidents are defined.
                        if (typeof data.risks[index].risk_incidents[i].incidents[0] != 'undefined') {
                            var when = new Date(data.risks[index].risk_incidents[i].incidents[0].incident_time * 1000);
                            var reported = new Date(data.risks[index].risk_incidents[i].incidents[0].created_at * 1000);
                            showIncidence = new google.maps.InfoWindow({
                                content: format + "<tr><td>Incident type</td><td>" + data.risks[index].risk_incidents[i].incidents[0].title + "</td></tr>" +
                                        "<tr><td>Occurred on </td><td>" + when.getDate() + "/" + (when.getMonth() + 1) + "/" + when.getFullYear() + "(DD/MM/YYYY)</td></tr>" +
                                        "<tr><td style='width:130px' >Reported on </td><td>" + reported.getDate() + "/" + (reported.getMonth() + 1) + "/" + reported.getFullYear() + "(DD/MM/YYYY)</td></tr></table>",
                                maxWidth: 400,
                                maxHeight: 300
                            });
                            addCir(circ, showIncidence);
                        } else {
                            showIncidence = new google.maps.InfoWindow({
                                content: "No data available",
                                maxWidth: 200
                            });
                            addCir(circ, showIncidence);
                        }
                        listOfIncidence.push(showIncidence);
                    }
                }
                console.log("Number of incidence " + incidence.length);
            }

            function addCir(circ, infoWindow) {

                //add a click event to the circle
                google.maps.event.addListener(circ, 'click', function(ev) {
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

               function selectTravelMode(mode) {
                travelMode = mode;
                calculateRoute();
            }
            function showUnsafeRoute() {
                if (document.getElementById("unsafeRoute").value === "on") {
                    calculateRoute();
                } else {
                    clearIncidenceCir();
                }

            }
