import os
import hashlib
import json
import requests

from flask import request, redirect, jsonify, Response, session as login_session, make_response

from oauth2client.client import credentials_from_clientsecrets_and_code

from config.config import config
from config.flask_config import app
from exception.exception_helper import InvalidUsage

@app.route('/api/auth/initialize')
def initialize():
    state = hashlib.sha256(os.urandom(1024)).hexdigest()
    login_session['state'] = state

    response = make_response()
    response.set_cookie('XSRF-TOKEN', value=state, secure=config.ENABLE_SSL, httponly=False)
    response.headers['Access-Control-Allow-Credentials'] = 'true'

    if config.ENABLE_CORS:
        response.headers["Access-Control-Allow-Origin"] = config.CORS_URL
    return response

@app.route('/api/auth/gconnect', methods=['POST'])
def gconnect():
    # Exchange auth code for access token, refresh token, and ID token
    auth_code = request.data
    credentials = credentials_from_clientsecrets_and_code('client_secret.json', ['email'], auth_code, 'Invalid client id')

    # Call Google API
    #http_auth = credentials.authorize(httplib2.Http())

    gplus_id = credentials.id_token['sub']

    stored_credentials = login_session.get('credentials')
    stored_gplus_id = login_session.get('gplus_id')

    if stored_credentials and gplus_id == stored_gplus_id:
        response = make_response(json.dumps('Current user is already connected.'), 200)
        return response

    login_session['credentials'] = credentials.access_token
    login_session['gplus_id'] = gplus_id

    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)
    data = answer.json()

    new_data = json.dumps({'name': data['name']})

    response = make_response(new_data)
    if config.ENABLE_CORS:
        response.headers["Access-Control-Allow-Origin"] = config.CORS_URL
    response.headers["Content-Type"] = "application/json"
    return response

@app.before_request
def enableCSRFProtection():
    """ see https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection """

    if request.method == 'OPTIONS':
        return

    if request.url.endswith('/auth/initialize'):
        return

    print request.cookies
    print request.headers.get('X-XSRF-TOKEN')
    print login_session.get('state')
    # If this request does not have `X-XSRF-TOKEN` header, this could be a CSRF
    if login_session.get('state') != request.headers.get('X-XSRF-TOKEN'):
        raise InvalidUsage('Bad request.', 401)

@app.after_request
def enableJSONHijackingProtection(response):
    """ see https://docs.angularjs.org/guide/security#json-hijacking-protection """
    if response.mimetype == 'application/json' and int(response.status[0:3]) < 400:
        response.data = ")]}',\n" + response.data
    return response
