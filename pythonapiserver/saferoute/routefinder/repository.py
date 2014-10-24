from pymongo import MongoClient
import math


PADDING = 100

connectionString = 'mongodb://saferoute:saferoute@ds041347.mongolab.com:41347/saferoutedb'
client = MongoClient(connectionString)
db = client.saferoutedb
collection = db.test2


def post_new_incident(post_sql):
    post_id = collection.insert(post_sql)
    print("incident posted with id" + post_id)


def query_all_incidents_in_db():
    all_posts = collection.find({})
    for p in all_posts:
         print p['geometry']
    return all_posts


def query_incidents_within_polygon(polygon):
    all_posts = collection.find({"geometry": {"$geoWithin": {"$polygon": polygon}}})
    # for p in all_posts:
    #     print p
    return all_posts


# Creates a polygon around the line
# This is used to find the polygon to query the database with
def create_polygon_wrapper(inpoints, padding):
    results = []
    for i in range(len(inpoints)):
        current = inpoints[i]
        if i < len(inpoints) - 1:
            after = inpoints[i+1]
            next_theta = math.atan2(after[1]-current[1], after[0]-current[0])

        previous = inpoints[i-1]
        prev_theta = math.atan2(previous[1]-current[1], previous[0]-current[0])

        #if we're at the first or last point, pretend that the route extends straight beyond that
        #this will let us draw the box correctly
        if i == 0:
            prev_theta = next_theta + math.pi
        if i == len(inpoints) - 1:
            next_theta = prev_theta + math.pi

        bisector_theta = ((prev_theta + next_theta)/2) % math.pi
        #print(inpoints[i])
        #print(bisector_theta)
        #print(bisector_theta + math.pi)

        inside_range = [prev_theta % (2 * math.pi)]
        inside_range.append(inside_range[0] + math.pi)

        new_p = [[padding * math.cos(bisector_theta), padding * math.sin(bisector_theta)],
                 [padding * math.cos(bisector_theta + math.pi), padding * math.sin(bisector_theta + math.pi)]]

        if (bisector_theta > inside_range[0] and bisector_theta < inside_range[1]) or \
                (bisector_theta > inside_range[0] - math.pi * 2 and bisector_theta < inside_range[1] - math.pi * 2):
                tmp = new_p[1]
                new_p[1] = new_p[0]
                new_p[0] = tmp

        for p in range(len(new_p)):
            new_p[p][0] += current[0]
            new_p[p][1] += current[1]

        results.append(new_p[0])
        results.insert(0, new_p[1])

    return results




