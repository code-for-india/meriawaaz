import urllib
import json
from django.http import HttpResponse
from incidentapi.controllers import get_incidents_near_location
import time
from routefinder.probabilityfinder import calc_probability
import math

"""
    Methods to find route and populate with warnings.
"""

DIRECTION_BASE_URL = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&alternatives=true'

# Set default proximity to 1km.
DEFAULT_PROXIMITY = 500


def directions(request):
    origin = request.GET.get('origin')
    destination = request.GET.get('destination')
    mode = request.GET.get('mode', '')
    result = get_directions_from_google(origin, destination, mode)
    result = add_risk_element_to_result(result.read())
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


def add_risk_element_to_result(html):
    complete_response = json.loads(html)
    routes = complete_response["routes"]

    #create route_risk wrappers
    route_risks = []

    for route in routes:
        total_route_risk = 0
        route_risk = {}

        #extract steps in a route
        legs = route["legs"]
        steps = legs[0]["steps"]

        #for each step append to step_risks and add to total risk of route
        step_risks = []
        step_incidents = []
        for step in steps:
            avg_loc = average_out_path(step["start_location"]["lat"], step["start_location"]["lng"],
                                       step["end_location"]["lat"], step["end_location"]["lng"])
            mod_incidents = []
            incidents = get_incidents_near_location(avg_loc[0], avg_loc[1], DEFAULT_PROXIMITY)
            for incident in incidents:
                mod_incidents.append(incident.to_dict())
            step_risk = calc_probability(incidents)
            step_risks.append({"lat": avg_loc[0], "lng": avg_loc[1], "risk": step_risk})
            step_incidents.append({"lat": avg_loc[0], "lng": avg_loc[1], "incidents": mod_incidents})
            total_route_risk += step_risk

        #populate route risk with total risk of its steps and risk breakdown
        route_risk["total_risk"] = total_route_risk
        route_risk["risk_breakdown"] = step_risks
        route_risk["risk_incidents"] = step_incidents

        #for each route append to route risks at root level
        route_risks.append(route_risk)

    complete_response["risks"] = route_risks

    return complete_response

PADDING = 100


def create_polygon_wrapper(points):
    results = []
    for i in range(1, len(points)-1):
        previous = points[i-1]
        current = points[i]
        after = points[i+1]

        prev_theta = math.atan2(previous[1]-current[1], previous[0]-current[0])
        next_theta = math.atan2(after[1]-current[1], after[0]-current[0])

        bisector_theta = (prev_theta + next_theta)/2

        new_p = [[PADDING * math.cos(bisector_theta), PADDING * math.sin(bisector_theta)],
                 [PADDING * math.cos(bisector_theta + math.pi), PADDING * math.sin(bisector_theta + math.pi)]]

        for p in range(len(new_p)):
            new_p[p][0] += current[0]
            new_p[p][1] += current[1]

        results.append(new_p[0])
        results.insert(0, new_p[1])

        return results


def average_out_path(start_lat, start_lng, end_lat, end_lng):
    #for now we assume paths are mostly straight and use it's linear mean
    return [(start_lat + end_lat)/2, (start_lng + end_lng)/2]


points = [(-4, 4), (-2, 0), (1, -4)]
print(create_polygon_wrapper(points))