import os
import hashlib
import json
import requests

from flask import request, redirect, jsonify, Response, session as loginSession, make_response

from oauth2client.client import credentials_from_clientsecrets_and_code

from config.config import config
from config.flask_config import app
from model.entities import User
from model.repository import UserRepo, CategoryRepo, CategoryItemRepo
from exception.exception_helper import InvalidUsage

def setUserSession(credentials, providerId, user):
    loginSession['credentials'] = credentials
    loginSession['provider_id'] = providerId
    loginSession['user_id'] = user.id
    loginSession['user_name'] = user.userName
    loginSession['email'] = user.email
    loginSession['picture'] = user.picture

def clearUserSession():
    def remove(propertyName):
        if loginSession.get(propertyName):
            del loginSession[propertyName]

    remove('credentials')
    remove('user_id')
    remove('user_name')
    remove('email')
    remove('picture')

def saveUser(userName, email, picture):
    storedUser = UserRepo.findByEmail(email)

    user = storedUser if storedUser else User()

    user.userName = userName
    user.email = email
    user.picture = picture

    return UserRepo.createOrUpdate(user)

def isConnected(providerId):
    storedCredentials = loginSession.get('credentials')
    return storedCredentials and providerId == loginSession.get('provider_id')

@app.route('/api/auth/initialize')
def initialize():
    state = hashlib.sha256(os.urandom(1024)).hexdigest()
    loginSession['state'] = state

    response = make_response()
    response.set_cookie('XSRF-TOKEN', value=state, secure=config.ENABLE_SSL, httponly=False)

    response.headers['Access-Control-Allow-Credentials'] = 'true'

    if config.ENABLE_CORS:
        response.headers["Access-Control-Allow-Origin"] = config.CORS_URL

    return response

@app.route('/api/auth/disconnect', methods=['POST'])
def disconnect():

    credentials = loginSession.get('credentials')

    if not credentials:
        raise InvalidUsage('Current user is not connected.', 401)

    params = {'token': credentials }
    result = requests.get("https://accounts.google.com/o/oauth2/revoke", params=params)

    if result.status_code == 200:
        clearUserSession()
        return jsonify('Successfully disconnected.')
    elif result.status_code == 400:
        return jsonify('User already disconnected.')
    else:
        raise InvalidUsage('Failed to revoke token for given user.', 400)

@app.route('/api/auth/gconnect', methods=['POST'])
def gconnect():
    # Exchange auth code for access token, refresh token, and ID token
    credentials = credentials_from_clientsecrets_and_code(config.SECRETS_PATH,
                                                          ['profile', 'email'],
                                                          request.data, # one time token
                                                          'Invalid client id')

    providerId = credentials.id_token['sub']

    if (isConnected(providerId)):
        return jsonify('Current user is already connected.')

    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", params=params)
    data = answer.json()

    user = saveUser(userName=data['name'],
                    email=data['email'],
                    picture=data['picture'] + "?sz=40")

    setUserSession(credentials=credentials.access_token,
                   providerId=providerId,
                   user=user)

    return jsonify('Successfully connected.')

@app.route('/api/auth/profile')
def getProfileJSON():
    if not loginSession.get('credentials'):
        raise InvalidUsage('UNAUTHORIZED.', 401)

    data = {'name': loginSession['user_name'],
            'picture': loginSession['picture'],
            'email': loginSession['email']}

    return jsonify(data)

def checkCategoryItem(method, parts):
    # user must be logged in
    if method == 'POST':
        categoryId = parts[-2]
        print categoryId

        if not loginSession.get('credentials') or not categoryId.isdigit():
            raise InvalidUsage('UNAUTHORIZED.', 401)

        if not CategoryRepo.isOwner(categoryId, loginSession.get('user_id')):
            raise InvalidUsage('UNAUTHORIZED.', 401)

    # user must be the resource owner
    if method in ['PUT', 'DELETE']:
        categoryItemId = parts[-1]
        if not loginSession.get('credentials') or not categoryItemId.isdigit():
            raise InvalidUsage('UNAUTHORIZED.', 401)

        if not CategoryItemRepo.isOwner(categoryItemId, loginSession.get('user_id')):
            raise InvalidUsage('UNAUTHORIZED.', 401)

def checkCategory(method, parts):
    # user must be logged in
    if method == 'POST' and not loginSession.get('credentials'):
        raise InvalidUsage('UNAUTHORIZED.', 401)

    # user must be the resource owner
    if method in ['PUT', 'DELETE']:
        categoryId = parts[-1]
        if not loginSession.get('credentials') or not categoryId.isdigit():
            raise InvalidUsage('UNAUTHORIZED.', 401)

        if not CategoryRepo.isOwner(categoryId, loginSession.get('user_id')):
            raise InvalidUsage('UNAUTHORIZED.', 401)

@app.before_request
def authorizeResources():
    parts = request.path.split('/')
    method = request.method

    if 'item' in parts:
        checkCategoryItem(method, parts)
    elif 'category' in parts:
        checkCategory(method, parts)

@app.before_request
def enableCSRFProtection():
    """ see https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection """

    if request.method != 'POST' or request.method != 'PUT' or request.method != 'DELETE':
        return

    if request.url.endswith('/auth/initialize'):
        return

    # If this request does not have `X-XSRF-TOKEN` header, this could be a CSRF
    if loginSession.get('state') != request.headers.get('X-XSRF-TOKEN'):
        raise InvalidUsage('UNAUTHORIZED.', 401)

@app.after_request
def enableJSONHijackingProtection(response):
    """ see https://docs.angularjs.org/guide/security#json-hijacking-protection """
    if response.mimetype == 'application/json' and response.status_code < 400:
        response.data = ")]}',\n" + response.data
    return response
