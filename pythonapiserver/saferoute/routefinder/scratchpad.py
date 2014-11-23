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
    "title": "Ishita test",
    "risk_index": "",
    "updated_at": {
        "date": "2014-04-13T22:49:53.992Z"
    },
    "geometry": {
    "type": "Point",
    "coordinates": [28.65796293568523, 77.22376465663768]
    },
    "location": "Ishita test",
    "incident_types": "Commenting",
    "created_at": {
        "date": "2014-04-13T22:49:53.992Z"
    },
    "description": ""
}

#Access to collection test2
#post_id = collection.insert(post)
post_id = collection.insert(post2)
#Query the inserted record using post_id
#print collection.find_one({'_id': post_id})

#Print geometry for all the records.
#all_posts = db.test2.find({})

#for p in all_posts:
  #print p['geometry']

polygon = [[0, 0], [150, 0], [150, 150], [0, 150]]
angloarabicpolygon = [[28.63118334214266, 77.22318186506033], [28.653113381974745, 77.22407389779961], [28.651909669708107, 77.23465721496754], [28.645699, 77.21407410871123]]

ganeshvatikawrapper = [[28.649287730291892, 77.22603818503245], [28.652614888848323, 77.22639363695828], [28.653113381974745, 77.22407389779961], [28.647880676892395, 77.21932726256298], [28.64313627959646, 77.2195053619707], [28.641949057840925, 77.22237759054913], [28.63945225785734, 77.21960593493966], [28.63867949685335, 77.22212740654884], [28.64160996668352, 77.22307289128875], [28.64118083331648, 77.21407410871123], [28.632498303146647, 77.21557339345115], [28.63118334214266, 77.22318186506033], [28.64308254215908, 77.23131500945085], [28.64713272040354, 77.2275794380293], [28.644596523107605, 77.22771633743702], [28.645452018025235, 77.22881370220038], [28.648401711151674, 77.23435676304172], [28.651909669708107, 77.23465721496754]]

all_posts = collection.find({"geometry": {"$geoWithin": {"$polygon": ganeshvatikawrapper}}})
#db.test2.find ({ geometry : { $geoWithin : { $polygon : [[0, 0], [150, 0], [150, 150], [0, 150]] } } })
#for p in all_posts:
    #if "Ishita" in str(p):
    #print p


# print(all_posts)

