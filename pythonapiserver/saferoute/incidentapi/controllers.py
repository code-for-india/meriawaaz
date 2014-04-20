"""
Optional methods to get incidents within a radius.
"""

from models import Incident

LAT_TO_M = 111200.0

def get_incidents_near_location(lat, lng, radius=0):
    """Gets incidents based on location and a radius. Radius is given in meters.

    Args:
        lat: latitue of location.
        lng: longitude of location.
        radius: radius in meters, defaults to 0.
    Returns:
        results: List of Incidents within give radius.
    """
    here = {}
    if lat:
        lat_lower_bound, lat_greater_bound = get_bounds(lat, radius)
        here["latitude"] = {'$lt' : lat_greater_bound, '$gt' : lat_lower_bound}
    if lng:
        lng_lower_bound, lng_greater_bound = get_bounds(lng, radius)
        here["longitude"] = {'$lt' : lng_greater_bound, '$gt' : lng_lower_bound}
    results = Incident.objects.raw_query(here)
    return results

def get_bounds(measure, radius=0):
    """Gets upper and lower bounds using radius.

    Args:
        measure: a measure of latitude or longitude.
        radius: radius in meters.
    Returns:
        lower_bound, greater_bound: tuple of lower and greater bounds near latitude or longitude.
    """
    change_unit = float(radius)/LAT_TO_M or 0
    greater_bound = measure + change_unit
    lower_bound = measure - change_unit
    return lower_bound, greater_bound