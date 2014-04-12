from django.test import TestCase
from guestbook.models import Greeting

class SimpleTest(TestCase):
    def setUp(self):
        Greeting(content='This is a test greeting').save()

    def test_setup(self):
        self.assertEqual(1, len(Greeting.objects.all()))
        self.assertEqual('This is a test greeting', Greeting.objects.all()[0].content)
