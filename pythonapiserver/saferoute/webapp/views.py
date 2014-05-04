import urllib
import json
from django.http import HttpResponse
from django.shortcuts import render, render_to_response
from django.template import RequestContext, loader
from incidentapi.controllers import get_incidents_near_location


"""
    Serves base templates.
"""

def home(request):
    return render_to_response('index.html',
        {},
        context_instance=RequestContext(request))
