from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

API_VERSION = 0

urlpatterns = patterns('',
  # Examples:
  # url(r'^$', 'saferoute.views.home', name='home'),
  # url(r'^blog/', include('blog.urls')),

  url(r'^admin/', include(admin.site.urls)),
  url(r'^directions', 'routefinder.views.directions'),

  #Incident API
  url(r'^v%s/incidents$' % API_VERSION, 'incidentapi.views.incidents_handler'),
  url(r'^v%s/incidents/(?P<incident_id>.+?)$' % API_VERSION, 'incidentapi.views.incident_handler'),
)
