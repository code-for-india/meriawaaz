import math
from repository import query_all_incidents_in_db

"""
   we calculate the risk, also referred to as the probability of incident occurring at a given co-ordinate
    using a Logistic Function:

    y = a1x1 + a2x2 + ... + aNxN

    where y is the weighted sum (not yet the [0,1] probability) of external metrics used to determine risk,
    where x is a external metric being considered
    where co-efficient a is the positive or negative weight given to a metric

    eg-1  let x be the 'recency' of the crime determined in number of minutes
    then it's co-efficient can be an positive weight to show positive co-relation with risk for recent incidents

    eg-2 let let x stand for specific type of crime namely eve-teasing.
    then it's co-efficient can again be positive weight who's magnitude reflects the severity of eve teasing.

    eg-3 let let x stand for the distance to the nearest police station
    then it's co-efficient can will be a negative weight to show inverse  co-relation with risk at a given co-ordinate.


    Finally the risk probability S is calculated from y using:

    S = 1 / ( 1 + e^(-y) )

"""

#class Weights:
#    recency=10
#    eve_teasing=5
#    oglingincident=3
#    taking_pictures=4
#    catcalls=4
#    commenting=3
#    rape=10
#    indecent_exposure=6
#    groping=8
#    sexual_invites=6
#    poor_lighting=5
#    chain_snatching=7
#    police_proximity=-10

weights_dict = {u'Whistling': 2, u'Sexual Invites': 6, u'Poor / No Street Lighting': 5, u'Catcalls/Whistles': 2, u'Molestation': 7,
                u'Ogling/Facial Expressions': 4, u'Commenting': 3, u'Indecent exposure': 6, u'Rape / Sexual Assault': 10,
                u'Chain Snatching': 7, u'Eve teasing': 5,
                u'Touching /Groping': 6, u'Taking pictures': 4, u'Gold snatch ': 5, u'Rape': 10, u'Theft ': 7}


#utiltiy method to find what type of incidents are
#currently reported in our dataset
def print_unique_keys():
    incident_types = {}
    incidents = query_all_incidents_in_db()
    for incident in incidents:
        all_incident_type = incident.to_dict()["incident_types"]
        if all_incident_type:
            all_incident_type = incident.to_dict()["incident_types"].split(',')
            for incident_type in all_incident_type:
                if incident_type not in incident_types:
                    incident_types[incident_type] = 0

    print(incident_types)


def calc_risk_probability(incidents):
    return weight_to_prob(calc_incident_weight(incidents))


def weight_to_prob(y):
    #the following coefficients have been heuristically choosen
    shift = 2000
    scale = 500
    risk = round(1/(1 + math.exp(-((y-shift)/scale))), 1)
    return risk


def calc_incident_weight(incidents):
    total_incident_weight = 0
    for incident in incidents:
        all_incident_type = incident["incident_types"]
        if all_incident_type:
            all_incident_type = all_incident_type.split(',')
            for incident_type in all_incident_type:
                if incident_type in weights_dict:
                    total_incident_weight += weights_dict[incident_type]
    return total_incident_weight




