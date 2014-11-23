#!/usr/bin/env python
import urllib
import re
import time
import datetime
import json

from bs4 import BeautifulSoup
from pygeocoder import Geocoder
from pygeocoder import Geocoder


TOTAL_PAGES = 196

def main():

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

        geometry = {}
        geometry['type'] = 'Point'
        geometry['coordinates'] = [latitude, longitude]
        # report_data['latitude'] = latitude
        # report_data['longitude'] = longitude
        report_data['geometry'] = geometry

      except:
        print "Geocode error"

      datestr = item.find(class_=re.compile("r_date"))
      datestring = datestr.string
      datetimestamp = time.mktime(
        datetime.datetime.strptime(datestring, "%H:%M %b %d, %Y").timetuple())
      report_data['incident_time'] = int(datetimestamp)

      json_data = json.dumps(report_data)

      #print(json_data)
      # uncomment below to write to database
      #post_new_incident(report_data)




if __name__ == "__main__":
  main()