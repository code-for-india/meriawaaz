import urllib
import json
from django.http import HttpResponse
from incidentapi.controllers import get_incidents_near_location


"""
    Methods to find route and populate with warnings.
"""

DIRECTION_BASE_URL = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&alternatives=true'

# Set default proximity to 1km.
DEFAULT_PROXIMITY = 500


def directions(request):
    origin = request.GET.get('origin')
    destination = request.GET.get('destination')
    result = get_directions_from_google(origin, destination)
    result = add_risk_element_to_result(result.read())
    response = HttpResponse(json.dumps(result), content_type="application/json")
    response['Access-Control-Allow-Origin'] = '*'
    return response


def get_directions_from_google(origin, destination, **geo_args):
    geo_args.update({
        'origin': origin,
        'destination': destination
    })

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
            step_risk = len(incidents)
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


def average_out_path(start_lat, start_lng, end_lat, end_lng):
    #for now we assume paths are mostly straight and use it's linear mean
    return [(start_lat + end_lat)/2, (start_lng + end_lng)/2]