from pymongo import MongoClient
import math


PADDING = 100

connectionString = 'mongodb://saferoute:saferoute@ds041347.mongolab.com:41347/saferoutedb'
client = MongoClient(connectionString)
db = client.saferoutedb
collection = db.test2


def post_new_incident(post_sql):
    post_id = collection.insert(post_sql)
    #print("incident posted with id" + post_id)


def query_all_incidents_in_db():
    all_posts = collection.find({})
    #for p in all_posts:
         #print p['geometry']
    return all_posts


def query_incidents_within_polygon(polygon):
    all_posts = collection.find({"geometry": {"$geoWithin": {"$polygon": polygon}}})
    # for p in all_posts:
    #     print p
    return all_posts







