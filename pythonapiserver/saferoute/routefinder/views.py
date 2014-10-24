import urllib
import json
from django.http import HttpResponse
import time
from routefinder.repository import create_polygon_wrapper
from routefinder.repository import query_incidents_within_polygon
from routefinder.probabilityfinder import calc_risk_probability


"""
    Methods to find route and populate with warnings.
"""

DIRECTION_BASE_URL = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&alternatives=true'

# width to create the margin around path within which polygon
# previous incidents would be looked at to calculate risk
WRAPPER_WIDTH = 100


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

    for route in routes:
        path = []
        #in our use case since no waypoints are specified google maps will only return on leg
        for step in route["legs"][0]["steps"]:
            point = [step["start_location"]["lat"], step["start_location"]["lng"]]
            path.append(point)

        last_point = route["legs"][0]["steps"][-1]["end_location"]
        point = [last_point["lat"], last_point["lng"]]
        path.append(point)

        path_risk_wrapper = create_polygon_wrapper(path, WRAPPER_WIDTH)
        incidents_around_path = query_incidents_within_polygon(path_risk_wrapper)
        route_risk = calc_risk_probability(incidents_around_path)

        route_incidents = []
        for i in incidents_around_path:
            route_incidents.append(i)

        print(route_incidents)

        all_route_risks.append({"route_risk": route_risk, "route_incidents": route_incidents})

    complete_response["risks"] = all_route_risks
    return complete_response
