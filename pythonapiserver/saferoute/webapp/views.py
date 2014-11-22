from django.shortcuts import render, render_to_response
from django.template import RequestContext


"""
    Serves base templates.
"""

def home(request):
    return render_to_response('index.html',
        {},
        context_instance=RequestContext(request))
