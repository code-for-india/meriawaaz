"""
APIs for getting and inserting incident related data.
"""
import json
from bson import json_util
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from repository import query_all_incidents_in_db
from repository import post_new_incident

@csrf_exempt
def incidents(request):
    if request.method == 'GET':
        all_incidents_cursor = query_all_incidents_in_db()
        mod_incidents = []
        for item in all_incidents_cursor:
            item = json.dumps(item, default=json_util.default)
            mod_incidents.append(item)
        return HttpResponse(json.dumps(mod_incidents), content_type="application/json")
    elif request.method == 'POST':
        data = json.loads(request.body)
        post_new_incident(data)
        print("data being saved: " + str(data))
        return HttpResponse(json.dumps(data, default=json_util.default), content_type="application/json")
    else:
        return HttpResponseBadRequest('This method is not supported.')
