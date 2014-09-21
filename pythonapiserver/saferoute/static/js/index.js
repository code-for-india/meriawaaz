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
                    async : false,
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
            function reverseGeoCode(lat, lng) {
                var address = "";
                $.ajax({
                    url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat+","+lng,
                    type: "POST",
                    async : false,
                    success: function(res) {
                        address = res.results[0].formatted_address;
                    },
                    error: function(responseText) {
                        console.log(responseText);
                    }
                });
                return address;
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

                var reportLoc = new google.maps.places.Autocomplete(document.getElementById('reportLoc'),{ types: ['geocode'] });
                reportLoc.bindTo('bounds', repor_map); 
              
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
                            repor_map.setZoom(11);
                            
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
                    
                });
            }
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
            var prevMarker;
            var currentDT;
            function initAndAddMarker(marker) {
                clearReportMarkers();
                prevMarker = marker;
            }
            

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
                        $("#reportLoc").attr("placeHolder", "Incident location ("+results[0].formatted_address+ " )");
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
            $('#report_form').live('pageinit', function() {
                currentDT = new Date().toString('yyyy/MM/dd HH:mm');
                $(".date-time-picker-class").datetimepicker({value: currentDT, mask: '9999/19/39 29:59', });
                 navigator.geolocation.getCurrentPosition(locSuccessReport, locErrorReport);
           });
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
               
                $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.1});
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
//                    var currentPositionMarker = new google.maps.Marker({
//                        position: currentPosition,
//                        map: map,
//                        title: "Current position"
//                    });
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
                var fromAddr = new google.maps.places.Autocomplete(document.getElementById('from'),{ types: ['geocode'] });
                var toAddr = new google.maps.places.Autocomplete(document.getElementById('to'),{ types: ['geocode'] });
                fromAddr.bindTo('bounds', map); 
                toAddr.bindTo('bounds', map);  
                google.maps.event.addListener(toAddr, 'place_changed', function() {
                   // if(typeof $("#fromAddr").val() !== 'undefined' && $("#fromAddr").val() !== null) {
                 
                     calculateRoute();
                   // }
                  });

            }

            function locErrorSafeRoute(error) {
                $("#from").attr("placeHolder", "Enter current location");
                $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.1});
                 initSafeRoute();
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
                //let store this address as an incident unless user selects something else.
                initReport(position.coords.latitude, position.coords.longitude);               
            }
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
                clearIncidenceCir();
                 $("#invAddr").text("");
                var origin, destination;
                //select the travel mode and route type.
                if (typeof travelMode == 'undefined') {
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
            var prevCustomMap, startMarker, stopMarker, travelMode;
            function plotSafeRoute(origin, targetDestination) {
                console.log("Travel mode chosen "+travelMode);
                
                triggerCount = 0;
                geoCode(targetDestination, function(targetlatLng) {
                    
                    if (typeof prevCustomMap !== 'undefined') {
                        //erase previous map.
                        prevCustomMap.setMap(null);
                    }
                    //Get the JSON messages by sending lat, lrng
		    var route = "/directions?origin="+origin+"&destination="+targetlatLng+"&mode="+travelMode;
                   
                   $.mobile.showPageLoadingMsg();             
                   $(".ui-loader-default").remove()
                   
                    $.get(route, function(data) {
                      $.mobile.hidePageLoadingMsg(); 
                      if(data.status !== "ZERO_RESULTS") {
                        findShortDist(data);
                        findSafeRoute(data);
                        var routeType = getRouteType();                        
                        console.log("Route type chosen (safe or time) index "+routeType); 
                        points = parseRoute(data, routeType);
                        
//                        $.mobile.loading('hide');
                        triggerCount = 0;
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
                       //plotting directions. <ul data-role="listview">
                       var completeRouteInstructions = '<br><table data-role="table" id="my-table" data-mode="reflow">'; 
                       completeRouteInstructions += '<tr  style="background-color:#e79952"> <th colspan="2"> Directions </th> </tr>';
                       for(inst in directionInstructions) {
                          var tmp = parseInt(inst) + 1;
                         completeRouteInstructions += ('<tr> <td class="ui-li ui-li-static ui-body-d"> '+tmp+". "+directionInstructions[inst]+'</td><td width="45" class="ui-li-static ui-body-d">'+distanceList[inst]+'</td></tr>');
                       }
                       completeRouteInstructions += '</table>';
                       $("#routeDirections").html(completeRouteInstructions);
                       $("#showTimeDis").show();
                       $("#saferoute_map_canvas").css({height: $("#basic_map").height() / 2.2});
                       //$("#red_handle").show();
                      } else {
                        $("#invAddr").text("Invalid source or destination");
                      }
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
             var directionInstructions = [], distanceList =[];
             var totDist = 0;
             var totTime = 0;
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
//                   for (i in routes) {
                    
//                jLegs = routes[i].legs
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
                    $("#timeDist").text("Time: "+totTime+" min and Distance: "+totDist + " km");
                }
//                  }
                
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
            var markerCluster;
            function plotIncidence(data, index) {
                //clearIncidenceCir();
                if(typeof markerCluster != 'undefined') {
                    markerCluster.clearMarkers();
                }
               var markers = [];
               var riskBrk = data.risks[index].risk_breakdown;
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
                            addIncidentPoints(marker1, showIncidence);
                            //addCir(circ, showIncidence);
                        } else {
                            showIncidence = new google.maps.InfoWindow({
                                content: "No data available",
                                maxWidth: 200
                            });                               
                            addIncidentPoints(marker1, showIncidence);
                           // addCir(circ, showIncidence);
                        }
                        listOfIncidence.push(showIncidence);
                    }
                }
                //marker icon as red.
                var mcOptions = {styles: [{
                    height: 53,
                    url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m3.png",
                    width: 53
                    }]};
                markerCluster = new MarkerClusterer(map, markers, mcOptions);
                //$("#numIncidents").html("<strong> Incidents on this route # "+incidence.length+"</strong>");
                console.log("Number of incidence " + riskBrk.length);
            }
            
             function addIncidentPoints(marker, infoWindow) {

                //add a click event to the circle
                google.maps.event.addListener(marker, 'click', function(ev) {
                    //call  the infoWindow
                    infoWindow.setPosition(ev.latLng);
                    infoWindow.open(map);
                });
                
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
            
            function getRouteType() {
              var routeType;
                 if (document.getElementById("routeType").value === "safe") {
                    routeType = safeRouteIndex;
                 } else {
                    routeType = fastRouteIndex;
                 }
              return routeType;
            }
            function showUnsafeRoute() {
                if (document.getElementById("unsafeRoute").value === "on") {
                    calculateRoute();
                } else {
                    clearIncidenceCir();
                }

            }
            
            
