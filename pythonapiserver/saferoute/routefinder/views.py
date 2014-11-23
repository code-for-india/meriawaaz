import urllib
import json
import time
import math

from django.http import HttpResponse
from bson import json_util

from incidentapi.repository import query_incidents_within_polygon
from routefinder.probabilityfinder import calc_risk_probability


"""
    Methods to find route and populate with warnings.
"""

DIRECTION_BASE_URL = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&alternatives=true'

# width to create the margin around path within which polygon
# previous incidents would be looked at to calculate risk

KM_TO_LAT = 1/111.0
WRAPPER_WIDTH = .1*KM_TO_LAT  # 100 meter padding
print(WRAPPER_WIDTH)


def directions(request):
    origin = request.GET.get('origin')
    destination = request.GET.get('destination')
    mode = request.GET.get('mode', '')
    result = get_directions_from_google(origin, destination, mode)
    result = add_incidents_around_area(result.read())
    response = HttpResponse(json.dumps(result), content_type="application/json")
    response['Access-Control-Allow-Origin'] = '*'
    return response


def get_directions_from_google(origin, destination, mode, **geo_args):
    geo_args.update({
        'origin': origin,
        'destination': destination
    })
    if mode:
        if mode.lower() == 'transit':
            url = DIRECTION_BASE_URL + '&mode=' + mode + '&' + urllib.urlencode(geo_args) + '&departure_time=' + \
                str(int(time.time()))
        else:
            url = DIRECTION_BASE_URL + '&mode=' + mode + '&' + urllib.urlencode(geo_args)
    else:
        url = DIRECTION_BASE_URL + '&' + urllib.urlencode(geo_args)
    return urllib.urlopen(url)


def add_incidents_around_area(html):
    complete_response = json.loads(html)
    routes = complete_response["routes"]
    all_route_risks = []
    #   pdb.set_trace()
    for route in routes:
        path = []
        #in our use case since no way-points are specified google maps will only return on leg
        for step in route["legs"][0]["steps"]:
            point = [step["start_location"]["lat"], step["start_location"]["lng"]]
            path.append(point)

        last_point = route["legs"][0]["steps"][-1]["end_location"]
        point = [last_point["lat"], last_point["lng"]]
        path.append(point)
        # pdb.set_trace()

        # print('============')
        path_risk_wrapper = create_polygon_wrapper(path, WRAPPER_WIDTH)
        #print("path_risk_wrapper: " + str(path_risk_wrapper))

        cursor_route_incidents = query_incidents_within_polygon(path_risk_wrapper)
        route_risk = calc_risk_probability(cursor_route_incidents)
        #print ("route_risk: " + str(route_risk))

        json_route_incidents = []
        for map_incident in cursor_route_incidents:
            json_route_incident = json.dumps(map_incident, default=json_util.default)
            json_route_incidents.append(json_route_incident)
        #print ("route_incidents: " + str(json_route_incidents))

        # provide incidents happening everywhere in the map rectangle
        x1_bound = min(path_risk_wrapper, key=lambda t: t[0])
        x2_bound = max(path_risk_wrapper, key=lambda t: t[0])
        y2_bound = max(path_risk_wrapper, key=lambda t: t[1])
        y1_bound = min(path_risk_wrapper, key=lambda t: t[1])

        map_bounds = [x1_bound, x2_bound, y2_bound, y1_bound]
        #print ("map_bounds: " + str(map_bounds))

        cursor_map_incidents = query_incidents_within_polygon(map_bounds)
        json_map_incidents = []
        for map_incident in cursor_map_incidents:
            json_map_incident = json.dumps(map_incident, default=json_util.default)
            json_map_incidents.append(json_map_incident)
        # print ("map_incidents: " + str(json_map_incidents))

        all_route_risks.append({"route_risk": route_risk, "route_incidents": json_route_incidents,
                                "map_incidents": json_map_incidents})

    complete_response["risks"] = all_route_risks
    return complete_response

# Creates a polygon around the line
# This is used to find the polygon to query the database with
# To manualy test how the polygon is drawn replace co-ords in testpolygonwrapper.html
# and open that file in browser
def create_polygon_wrapper(inpoints, padding):
    results = []
    for i in range(len(inpoints)):
        current = inpoints[i]
        if i < len(inpoints) - 1:
            after = inpoints[i+1]
            next_theta = math.atan2(after[1]-current[1], after[0]-current[0])

        previous = inpoints[i-1]
        prev_theta = math.atan2(previous[1]-current[1], previous[0]-current[0])

        #if we're at the first or last point, pretend that the route extends straight beyond that
        #this will let us draw the box correctly
        if i == 0:
            prev_theta = next_theta + math.pi
        if i == len(inpoints) - 1:
            next_theta = prev_theta + math.pi

        bisector_theta = ((prev_theta + next_theta)/2) % math.pi
        #print(inpoints[i])
        #print(bisector_theta)
        #print(bisector_theta + math.pi)

        inside_range = [prev_theta % (2 * math.pi)]
        inside_range.append(inside_range[0] + math.pi)

        new_p = [[padding * math.cos(bisector_theta), padding * math.sin(bisector_theta)],
                 [padding * math.cos(bisector_theta + math.pi), padding * math.sin(bisector_theta + math.pi)]]

        if (bisector_theta > inside_range[0] and bisector_theta < inside_range[1]) or \
                (bisector_theta > inside_range[0] - math.pi * 2 and bisector_theta < inside_range[1] - math.pi * 2):
                tmp = new_p[1]
                new_p[1] = new_p[0]
                new_p[0] = tmp

        for p in range(len(new_p)):
            new_p[p][0] += current[0]
            new_p[p][1] += current[1]

        results.append(new_p[0])
        results.insert(0, new_p[1])

    return results