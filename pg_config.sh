apt-get -qqy update
#apt-get -qqy install postgresql python-psycopg2
apt-get -qqy install python-flask python-sqlalchemy
apt-get -qqy install python-pip
apt-get -qqy install redis-server
pip install werkzeug==0.8.3
pip install flask==0.9
pip install Flask-Login==0.1.3
pip install Flask-KVSession==0.6.2
pip install -U flask-cors
pip install bleach
pip install redis
pip install oauth2client
pip install requests
pip install httplib2
pip install passlib
pip install itsdangerous
pip install flask-httpauth
pip install --upgrade google-api-python-client
#su postgres -c 'createuser -dRS vagrant'
su vagrant -c 'python "/vagrant/catalog/server/create_db.py"'
vagrantTip="[35m[1mThe shared directory is located at /vagrant\nTo access your shared files: cd /vagrant([m"
echo -e $vagrantTip > /etc/motd