import simplejson
import urllib
import json
from django.http import HttpResponse


'''
    Simple methods to return geo-code, may be deleted later
'''
GEOCODE_BASE_URL = 'http://maps.googleapis.com/maps/api/geocode/json'


def get_geocode_from_google(address="San+Francisco", sensor="false", **geo_args):
    geo_args.update({
        'address': address,
        'sensor': sensor
    })

    url = GEOCODE_BASE_URL + '?' + urllib.urlencode(geo_args)
    result = simplejson.load(urllib.urlopen(url))

    return simplejson.dumps([s['formatted_address'] for s in result['results']], indent=2)

def geocode(request):
    #TODO: make use of origin and destination coordiantes in request
    return HttpResponse(get_geocode_from_google())

'''
    Methods to find route and populate with warnings
'''

DIRECTION_BASE_URL = 'http://maps.googleapis.com/maps/api/directions/json?sensor=false&alternatives=true'


def get_directions_from_google(origin="37.3909762,-122.0663274", destination="37.4909762,-122.0663274", **geo_args):
    geo_args.update({
        'origin': origin,
        'destination': destination
    })

    url = DIRECTION_BASE_URL + '&' + urllib.urlencode(geo_args)
    #result = simplejson.load(urllib.urlopen(url))
    #TODO: parse xml to return warnings for each step in every left
    return urllib.urlopen(url)

def get_warning_for_step(start, end):
    #TODO: read for cumulative warning along the path from start to end
    return 200


def directions(request):
    #TODO: make use of origin and destination coordiantes in request
    result = get_directions_from_google()
    result = modify_result(result.read())
    return HttpResponse(json.dumps(result), content_type="application/json")


def modify_result(html):
    #TOD0: iterate instead of 0
    complete_response = json.loads(html)
    routes = complete_response["routes"]
    legs = routes[0]["legs"]
    steps = legs[0]["steps"]
    step = steps[0]

    risk = find_risk(step["start_location"]["lat"], step["start_location"]["lng"],
                     step["end_location"]["lat"], step["end_location"]["lng"])

    #TODO: add back risk to html
    return complete_response


def find_risk(start_lat, start_lng, end_lat, eng_lng):
    #TOD0: add database call
    return start_lat+start_lng+end_lat+eng_lng