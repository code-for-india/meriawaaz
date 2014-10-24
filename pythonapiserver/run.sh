#!/bin/sh
git pull
echo "=============Setting environment============"
if ! type "virtualenv" > /dev/null 2>&1; then
  if ! type "yum" > /dev/null 2>&1; then
  	sudo easy_install pip
  	sudo pip install virtualenv
  else
    sudo yum install virtualenv
  fi
fi
  virtualenv myenvironment
  source myenvironment/bin/activate
  pip install -r requirements.txt
  cd saferoute
  echo "Open the browser with the URL http://localhost:8000"
  python manage.py runserver
