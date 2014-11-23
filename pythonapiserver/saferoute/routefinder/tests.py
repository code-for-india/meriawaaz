"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

import unittest

from incidentapi.repository import create_polygon_wrapper


class RouteFinderTests(unittest.TestCase):
    def test_polygon_wrapper_along_route(self):
        legs_of_unit_diagnol = (0.5)**.5
        expected_results = [[10, -1], [-legs_of_unit_diagnol, -legs_of_unit_diagnol], [-1, 10],
                            [1, 10], [legs_of_unit_diagnol, legs_of_unit_diagnol], [10, 1]]
        inpoints = [[0, 10], [0, 0], [10, 0]]

        outpoints = create_polygon_wrapper(inpoints, 1)
       # print(outpoints)
       # print(expected_results)

        self.assertEqual(len(outpoints), len(expected_results))

        for i in range(len(inpoints)):
            for cord in range(2):
                self.assertAlmostEqual(outpoints[i][cord], expected_results[i][cord], delta=.01)

    def test_polygon_wrapper_along_route2(self):
        lud = (0.5)**.5
        expected_results = [[0, -11], [10+lud, -10-lud], [10+lud, lud], [lud, lud], [lud, 20-lud], [10-lud, 20-lud],
                            [9, 10], [11, 10], [10+lud, 20+lud], [-lud, 20+lud], [-lud, -lud], [10-lud, -lud], [10-lud,
                            -10+lud], [0, -9]][::-1]
        inpoints= [[10, 10], [10, 20], [0, 20], [0, 0], [10, 0], [10, -10], [0, -10]]

        outpoints = create_polygon_wrapper(inpoints, 1)
        print(outpoints)
        print()
        print(expected_results)

        self.assertEqual(len(outpoints), len(expected_results))

        for i in range(len(inpoints)):
            for cord in range(2):
                self.assertAlmostEqual(outpoints[i][cord], expected_results[i][cord], delta=.01)

unittest.main()