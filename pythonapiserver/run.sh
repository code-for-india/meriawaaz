#!/bin/sh
git pull
if  type "virtualenv" > /dev/null 2>&1; then
  echo "=============Setting environment============"
  virtualenv myenvironment
  source myenvironment/bin/activate
  pip install -r requirements.txt
  cd saferoute
  echo "Open the browser with the URL http://localhost:8000"
  python manage.py runserver
  else 
     sudo yum install virtualenv
fi
