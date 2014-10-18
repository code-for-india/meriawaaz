from pymongo import MongoClient


connectionString = 'mongodb://saferoute:saferoute@ds041347.mongolab.com:41347/saferoutedb'
client = MongoClient(connectionString)
db = client.saferoutedb
## test2 is a table name.
collection = db.test2
#Query the record from the table based on type
print collection.find_one({'type': 'Feature'})

#Sample data to insert
post = {

    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [
            4.6,
            10.1
        ]
    },
    "properties": {
        "name": "Google Islands2"
    }
}
#Access to collection test2
post_id = collection.insert(post)
#Query the inserted record using post_id
print collection.find_one({'_id': post_id})

#Print geometry for all the records.
all_posts = db.test2.find({})

#for p in all_posts:
  #print p['geometry']

polygon = [[0, 0], [0, 100], [100, 100], [100, 0]]
results = db.test2.find({"location": {"$geoWithin": {"$polygon": polygon}}})


print(results)

