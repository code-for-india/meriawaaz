from django.db import models
import calendar
import helpers
from django_mongodb_engine.contrib import MongoDBManager

"""
  Factory method to load incidents.
"""
class IncidentManager(models.Manager):

  fields = set([
    "uid",
    "title",
    "latitude",
    "longitude",
    "risk_index",
    "incident_types",
    "incident_time",
    "location",
    "description",
    "image_location"])

  def load_from_dict(self, data, incident=None):
    if incident is None:
      incident = Incident()
    for key, value in data.iteritems():
      if key in self.fields:
        setattr(incident, key, value)
    # UID doesn't exist, add it.
    if incident.uid is None:
      incident.uid = helpers.id_gen()
    return incident

"""
  Incident definition.
"""
class Incident(models.Model):
  uid = models.TextField(null=True, unique=True)
  title = models.TextField(null=True)
  latitude = models.FloatField(null=True)
  longitude = models.FloatField(null=True)
  risk_index = models.IntegerField(null=True)
  incident_types = models.TextField(null=True)
  location = models.TextField(null=True)
  description = models.TextField(null=True)
  image_location = models.TextField(null=True)
  incident_time = models.IntegerField(null=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  
  # Incident manager for special access.
  # objects = IncidentManager()
  objects = MongoDBManager()

  def __unicode__(self):
    return "%s, %s" % (self.uid, self.location)

  def to_dict(self):
    fields_dict = {
      "uid": self.uid,
      "title": self.title,
      "latitude": self.latitude,
      "longitude": self.longitude,
      "risk_index": self.risk_index,
      "incident_types": self.incident_types,
      "incident_time": self.incident_time,
      "location": self.location,
      "description": self.description,
      "image_location": self.image_location,
      "created_at": calendar.timegm(self.created_at.utctimetuple()),
      "updated_at": calendar.timegm(self.updated_at.utctimetuple())
    }
    return fields_dict


