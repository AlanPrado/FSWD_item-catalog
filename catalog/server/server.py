import hashlib
import httplib2
import json
import requests
import os

from flask import Flask, render_template, request, redirect, jsonify, Response, session as login_session, make_response
from flask_cors import CORS, cross_origin
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound

from oauth2client.client import credentials_from_clientsecrets_and_code

from config.config import config
from model.entities import Category, CategoryItem
from model.repository import repositories
from exception.exception_helper import InvalidUsage

base_dir = os.path.abspath(os.path.dirname(__file__))
template_dir = os.path.join(base_dir, 'static')
app = Flask(__name__,
            template_folder=template_dir,
            static_folder=template_dir,
            static_url_path="")

jinja_options = app.jinja_options.copy()

jinja_options.update(dict(
    block_start_string='<%',
    block_end_string='%>',
    variable_start_string='%%',
    variable_end_string='%%',
    comment_start_string='<#',
    comment_end_string='#>'
))

app.jinja_options = jinja_options

cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:9000"}})
app.config['CORS_HEADERS'] = 'Content-Type'

CLIENT_ID = json.loads(
    open('client_secret.json', 'r').read())['web']['client_id']

@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:9000"
    return response

@app.after_request
def enableJSONHijackingProtection(response):
    """ see https://docs.angularjs.org/guide/security#json-hijacking-protection """
    if response.mimetype == 'application/json':
        response.data = ")]}',\n" + response.data
    return response

@app.route('/api/initialize')
def initialize():
    state = hashlib.sha256(os.urandom(1024)).hexdigest()
    login_session['state'] = state
    response = make_response(json.dumps({ 'clientId': CLIENT_ID }), 200)
    # TODO: set secure=True in production
    response.set_cookie('XSRF-TOKEN', value=state, secure=False, httponly=True)
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:9000"
    response.headers["Content-Type"] = "application/json"
    return response

@app.route('/gconnect', methods=['POST'])
def gconnect():
    # If this request does not have `X-XSRF-TOKEN` header, this could be a CSRF
    if not request.headers.get('X-XSRF-TOKEN'):
        raise InvalidUsage('Bad request.', 401)

    print 'state=%s' % request.args.get('state')
    if request.args.get('state') != login_session['state']:
        raise InvalidUsage('Invalid state token.', 401)

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
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:9000"
    response.headers["Content-Type"] = "application/json"
    return response

########################################################
## Categories ##########################################
########################################################
@app.route('/api/category', methods=['POST'])
def addCategoryJSON():
    content = request.json

    try:
        category = Category(title=content["title"])
        repositories["Category"].createOrUpdate(category)
        return jsonify(category.serialize)
    except IntegrityError:
        raise InvalidUsage("There is another category with title '%s'." % content["title"])

@app.route('/api/category/<int:categoryId>')
def getCategoryJSON(categoryId):
    try:
        result = repositories["Category"].findByIdWithItems(categoryId)
        return jsonify(result.serialize)
    except NoResultFound:
        raise InvalidUsage("No category found")

@app.route('/api/category/<int:categoryId>', methods=['PUT'])
def updateCategoryJSON(categoryId):
    content = request.json
    try:
        category = repositories["Category"].findById(categoryId)
        category.title = content["title"]
        repositories["Category"].createOrUpdate(category)
        return jsonify(category.serialize)
    except NoResultFound:
        raise InvalidUsage("Category %s not found." % categoryId)
    except IntegrityError:
        raise InvalidUsage("There is another category with title '%s'." % content["title"])

@app.route('/api/category/<int:categoryId>', methods=['DELETE'])
def removeCategoryJSON(categoryId):
    try:
        category = repositories["Category"].findById(categoryId)
        repositories["Category"].delete(category)
        return Response()
    except NoResultFound:
        raise InvalidUsage("Category %s not found" % categoryId)

@app.route('/api/categories')
def getAllCategoriesJSON():
    categories = [row.serialize for row in repositories["Category"].findAll()]
    return Response(json.dumps(categories), mimetype="application/json")

########################################################
## Categories/Items ####################################
########################################################
@app.route('/api/category/<int:categoryId>/item', methods=['POST'])
def addItemJSON(categoryId):
    content = request.json
    item = CategoryItem(title=content["title"],
                        categoryId=categoryId,
                        description=content["description"])

    repositories["Category"].createOrUpdate(item)
    return jsonify(item.serialize)

@app.route('/api/category/<int:categoryId>/items')
def getCategoryWithItemsJSON(categoryId):
    try:
        category = repositories["Category"].findByIdWithItems(categoryId)
        return jsonify(category.serialize)
    except NoResultFound:
        raise InvalidUsage("Category %s not found." % categoryId)

@app.route('/api/category/<int:categoryId>/item/<int:itemId>')
def getItemJSON(categoryId, itemId):
    try:
        item = repositories["Item"].findById(itemId)
        return jsonify(item.serialize)
    except:
        raise InvalidUsage("Category item %s not found." % itemId)

@app.route('/api/category/<int:categoryId>/item/<int:itemId>', methods=['PUT'])
def updateItemJSON(categoryId, itemId):
    try:
        content = request.json

        item = repositories["Item"].findById(itemId)
        item.id = itemId
        item.title = content["title"]
        item.categoryId = categoryId
        item.description = content["description"]

        repositories["Item"].createOrUpdate(item)
        return jsonify(item.serialize)
    except NoResultFound:
        raise InvalidUsage("Category item %s not found." % itemId)

@app.route('/api/category/<int:categoryId>/item/<int:itemId>', methods=['DELETE'])
def removeItemJSON(categoryId, itemId):
    try:
        item = repositories["Item"].findById(itemId)
        repositories["Item"].delete(item)
        return Response()
    except NoResultFound:
        raise InvalidUsage("Category item %s not found" % itemId)

@app.route('/api/recent')
def getRecentJSON():
    return jsonify([row.serialize for row in repositories["Item"].findRecent()])

########################################################
if __name__ == '__main__':
    app.secret_key = config.SECRET_KEY
    app.debug = config.DEBUG
    app.run(host=config.HOST, port=config.PORT)
