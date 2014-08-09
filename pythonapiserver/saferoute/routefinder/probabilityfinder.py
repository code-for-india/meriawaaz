from collections import namedtuple
from enum import Enum


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


incident = Enum('incident', 'recency eve_teasing ogling taking_pictures catcalls commenting rape indecent_exposure'
                'groping sexual_invites poor_lighting chain_snatching')

metric_array_x = namedtuple("metric_array_x", "recency incident.eve_teasing incident.ogling "
                                              "incident.taking_pictures incident.catcalls incident.commenting "
                                              "incident.rape incident.indecent_exposure incident.groping"
                                              "incident.sexual_invites incident.poor_lighting incident.chain_snatching "
                                              "police_proximity")

weighted_array_a = metric_array_x(recency="10", eve_teasing="5", oglingincident="3", taking_pictures="4", catcalls="4",
                                  commenting="3", rape="10", indecent_exposure="6", groping="8", sexual_invites="6",
                                  poor_lighting="5", chain_snatching="7", police_proximity="-10")

incident_desc_x = namedtuple("incident_desc_x", "recency incident_type distance_from_police incident.recency incident.eve_teasing incident.ogling "
                                          "incident.taking_pictures incident.catcalls incident.commenting incident.rape"
                                          "incident.indecent_exposure incident.groping incident.sexual_invites "
                                          "incident.poor_lighting incident.chain_snatching")


def calculate_risk():
    pass