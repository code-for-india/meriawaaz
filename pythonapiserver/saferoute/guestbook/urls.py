from django.conf.urls.defaults import *

urlpatterns = patterns('guestbook.views',
    (r'^$', 'list_greetings'),
    (r'^sign$', 'create_greeting')
)