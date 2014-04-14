#!/usr/bin/env python
import os
import sys
import urllib
from bs4 import BeautifulSoup
from bs4 import SoupStrainer
import re
from pygeocoder import Geocoder
from pygeocoder import Geocoder
import time
import datetime
import json
from incidentapi.models import Incident, IncidentManager

TOTAL_PAGES = 144

def main():
  incidents = []
  i_manager = IncidentManager()
  for x in range(1, TOTAL_PAGES):
    url = "http://safecity.in/reports/fetch_reports?page=%i" % x
    print "url is" + url + "\n\n\n"
    f = urllib.urlopen(url)
    content = f.read()
    soup = BeautifulSoup(content)
    reports = soup.find_all(class_=re.compile("rb_report"))
    for item in reports:
      report_data = {}
      
      categories = item.find_all(class_=re.compile("r_cat-desc"))
      category_str = []
      for entry in categories:
        category_str.append(entry.string)
      report_data['incident_types'] = ",".join(category_str)

      desc = item.find(class_=re.compile("r_description"))
      report_data['description'] = desc.string

      title = item.find(class_=re.compile("r_title"))
      report_data['title'] = title.string
      if title.string:
        report_data['title'] = title.string.replace('\t', '').replace('\n', '')

      location = item.find(class_=re.compile("r_location"))
      report_data['location'] = location.string
      try:
        location_results = Geocoder.geocode(location)
        latitude,longitude = location_results[0].coordinates
        report_data['latitude'] = latitude
        report_data['longitude'] = longitude
      except:
        print "Geocode error"

      datestr = item.find(class_=re.compile("r_date"))
      datestring = datestr.string
      datetimestamp = time.mktime(
        datetime.datetime.strptime(datestring, "%H:%M %b %d, %Y").timetuple())
      report_data['incident_time'] = int(datetimestamp)

      print report_data
      incident = i_manager.load_from_dict(report_data)
      incident.save()




if __name__ == "__main__":
  main()