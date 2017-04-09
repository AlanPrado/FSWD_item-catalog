import json
import random
import string
import os

from flask import Flask, render_template, request, redirect, jsonify, Response, session as login_session
from flask_cors import CORS, cross_origin
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound

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

cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:9000"}})
app.config['CORS_HEADERS'] = 'Content-Type'

@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:9000"
    return response

@app.route('/')
def getIndexHTML():
    return render_template('index.html')

# Create anti-forgery state token
@app.route('/login')
def showLogin():
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in xrange(32))
    login_session['state'] = state
    return state

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
