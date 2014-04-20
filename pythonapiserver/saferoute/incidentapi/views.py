"""
APIs for getting and inserting incident related data.
"""
import urllib
import json
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from models import Incident, IncidentManager
from django.core import serializers
from django.core.exceptions import FieldError
from controllers import get_incidents_near_location

@csrf_exempt
def incidents_handler(request):
  if request.method == 'GET':
    incidents = Incident.objects.all()
    mod_incidents = []
    for item in incidents:
      mod_incidents.append(item.to_dict())
    return HttpResponse(json.dumps(mod_incidents), content_type="application/json")
  
  elif request.method == 'POST':
    if request.META['CONTENT_TYPE'] == 'application/json':
      data = json.loads(request.body)
      i_manager = IncidentManager()
      incident = i_manager.load_from_dict(data)
      incident.save()
      return HttpResponse(json.dumps(incident.to_dict()), content_type="application/json")
    else:
      return HttpResponseBadRequest('Request content is not application/json.')
  
  else:
    return HttpResponseBadRequest('This method is not supported.')


@csrf_exempt
def incident_query_handler(request):
  if request.method == 'GET':
    param_dict = {}
    mod_incidents = []
    for key,val in request.GET.items():
      param_dict[key] = val
    try:
      incidents = Incident.objects.filter(**param_dict)
      for item in incidents:
        mod_incidents.append(item.to_dict())
      return HttpResponse(json.dumps(mod_incidents), content_type="application/json")    
    except FieldError:
      return HttpResponseBadRequest('Unsupported query parameters.')
  else:
    return HttpResponseBadRequest('This method is not supported.')


@csrf_exempt
def incident_proximity_handler(request):
  if request.method == 'GET':
    param_dict = {}
    mod_incidents = []
    for key,val in request.GET.items():
      param_dict[key] = val
    try:
      if "latitude" in request.GET.keys() and "longitude" in request.GET.keys():
        lat = float(request.GET["latitude"])
        lng = float(request.GET["longitude"])
        radius = int(request.GET["radius"])
        if radius:
          incidents = get_incidents_near_location(lat, lng, radius)
        else:
          incidents = get_incidents_near_location(lat, lng)
        for item in incidents:
          mod_incidents.append(item.to_dict())
        print len(mod_incidents)
      return HttpResponse(json.dumps(mod_incidents), content_type="application/json")
    except FieldError:
      return HttpResponseBadRequest('Unsupported query parameters.')
  else:
    return HttpResponseBadRequest('This method is not supported.')


@csrf_exempt
def incident_handler(request, incident_id):
  try:
    incident = Incident.objects.get(uid=incident_id)
    if request.method == 'GET':
      json_data = json.dumps(incident.to_dict())
      return HttpResponse(json_data, content_type="application/json")
    
    elif request.method == 'PUT' or request.method == 'POST':
      data = json.loads(request.body)
      i_manager = IncidentManager()
      incident = i_manager.load_from_dict(data, incident)
      incident.save()
      return HttpResponse(json.dumps(incident.to_dict()), content_type="application/json")
    
    else:
      return HttpResponseBadRequest()
  
  except Incident.DoesNotExist:
    return HttpResponse("", content_type="application/json")
