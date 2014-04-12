import urllib
import json
from django.http import HttpResponse


'''
    Methods to find route and populate with warnings
'''

DIRECTION_BASE_URL = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&alternatives=true'


def directions(request):
    #TODE: remove default coordinates later
    origin = request.GET.get('origin', "37.3909762,-122.0663274")
    destination = request.GET.get('destination', "37.4909762,-122.0663274")
    result = get_directions_from_google(origin, destination)
    result = modify_result(result.read())
    return HttpResponse(json.dumps(result), content_type="application/json")


def get_directions_from_google(origin, destination, **geo_args):
    geo_args.update({
        'origin': origin,
        'destination': destination
    })

    url = DIRECTION_BASE_URL + '&' + urllib.urlencode(geo_args)
    return urllib.urlopen(url)


def modify_result(html):
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
        for step in steps:
            avg_loc = average_out_path(step["start_location"]["lat"], step["start_location"]["lng"],
                        step["end_location"]["lat"], step["end_location"]["lng"])
            step_risk = find_risk(avg_loc)
            step_risks.append({"lat": avg_loc[0], "lng": avg_loc[1], "risk": step_risk})
            total_route_risk += step_risk

        #populate route risk with total risk of its steps and risk breakdown
        route_risk["total_risk"] = total_route_risk
        route_risk["risk_breakdown"] = step_risks

        #for each route append to route risks at root level
        route_risks.append(route_risk)

    complete_response["risks"] = route_risks

    return complete_response


def average_out_path(start_lat, start_lng, end_lat, end_lng):
    #for now we assume paths are mostly straight and use it's linear mean
    return [(start_lat + end_lat)/2, (start_lng + end_lng)/2]


def find_risk(loc):
    #TOD0: add database call
    return 200
