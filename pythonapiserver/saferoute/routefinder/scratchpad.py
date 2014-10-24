from pymongo import MongoClient


connectionString = 'mongodb://saferoute:saferoute@ds041347.mongolab.com:41347/saferoutedb'
client = MongoClient(connectionString)
db = client.saferoutedb
## test2 is a table name.
collection = db.test2
#Query the record from the table based on type
#print collection.find_one({'type': 'Feature'})

#Sample data to insert

post = {

    "image_location": "",
    "incident_time": 1391865840,
    "uid": "27kcnw",
    "title": "incident1",
    "risk_index": "",
    "updated_at": {
        "date": "2014-04-13T22:49:53.992Z"
    },
    "geometry": {
    "type": "Point",
    "coordinates": [28.6358433, 77.2183475]
    },
    "location": "New Delhi Railway Station, New Delhi, Delhi 110006, India",
    "incident_types": "Touching /Groping",
    "created_at": {
        "date": "2014-04-13T22:49:53.992Z"
    },
    "description": ""
}

post2 = {

    "image_location": "",
    "incident_time": 1391865840,
    "uid": "27kcnw",
    "title": "incident2",
    "risk_index": "",
    "updated_at": {
        "date": "2014-04-13T22:49:53.992Z"
    },
    "geometry": {
    "type": "Point",
    "coordinates": [24.6135226, 74.2327543]
    },
    "location": "New Delhi Railway Station, New Delhi, Delhi 110006, India",
    "incident_types": "Touching /Groping",
    "created_at": {
        "date": "2014-04-13T22:49:53.992Z"
    },
    "description": ""
}

#Access to collection test2
post_id = collection.insert(post)
post_id = collection.insert(post2)
#Query the inserted record using post_id
#print collection.find_one({'_id': post_id})

#Print geometry for all the records.
#all_posts = db.test2.find({})

#for p in all_posts:
  #print p['geometry']

polygon = [[0, 0], [150, 0], [150, 150], [0, 150]]
#all_posts =  collection.find({"geometry": {"$geoWithin": {"$polygon": polygon}}})
#db.test2.find ({ geometry : { $geoWithin : { $polygon : [[0, 0], [150, 0], [150, 150], [0, 150]] } } })
#for p in all_posts:
 #   print p


#print(results)

