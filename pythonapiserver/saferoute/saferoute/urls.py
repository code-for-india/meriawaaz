from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.conf import settings
admin.autodiscover()

API_VERSION = 0

urlpatterns = patterns('',
  # Examples:
  # url(r'^$', 'saferoute.views.home', name='home'),
  # url(r'^blog/', include('blog.urls')),
  url(r'^directions', 'routefinder.views.directions'),

  #Incident API
  url(r'^v%s/incidents$' % API_VERSION, 'incidentapi.views.incidents_handler'),
  url(r'^v%s/incidents/query$' % API_VERSION, 'incidentapi.views.incident_query_handler'),
  url(r'^v%s/incidents/proximity$' % API_VERSION, 'incidentapi.views.incident_proximity_handler'),
  url(r'^v%s/incidents/(?P<incident_id>.+?)$' % API_VERSION, 'incidentapi.views.incident_handler'),

  # Webapp urls
  url(r'^$', 'webapp.views.home', name='home'),
)

if settings.DEBUG:
  urlpatterns += patterns('',
    url(r'^/static/(?P<path>.*)$', 'django.views.static.serve', {
      'document_root': '/static',
    }),
  )