# Install applications 
apt-get -qqy update
apt-get -qqy install postgresql python-psycopg2
apt-get -qqy install python-flask python-sqlalchemy
#apt-get -qqy install python-pip
easy_install pip
apt-get -qqy install redis-server

# Install modules
pip install werkzeug==0.8.3
pip install -U flask
pip install -U Flask-Login
pip install -U Flask-SQLAlchemy
pip install -U Flask-Migrate
pip install -U Flask-Script
pip install -U Flask-KVSession
pip install -U flask-cors
pip install -U bleach
pip install -U redis
pip install -U oauth2client
pip install -U requests
pip install -U httplib2
pip install -U passlib
pip install -U itsdangerous
pip install flask-httpauth
pip install --upgrade google-api-python-client
