import json

from flask import request, make_response, jsonify, session as loginSession

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound

from config.flask_config import app
from model.entities import CategoryItem
from model.repository import CategoryItemRepo, CategoryRepo
from exception.exception_helper import InvalidUsage

@app.route('/api/category/<int:categoryId>/item', methods=['POST'])
def addItemJSON(categoryId):
    content = request.json
    if not content["title"]:
        raise InvalidUsage("Title is a required field")

    item = CategoryItem(title=content["title"],
                        userId=loginSession.get('user_id'),
                        categoryId=categoryId,
                        description=content["description"])

    CategoryItemRepo.createOrUpdate(item)
    return jsonify(item.serialize)

@app.route('/api/category/<int:categoryId>/items')
def getCategoryWithItemsJSON(categoryId):
    try:
        category = CategoryRepo.findByIdWithItems(categoryId)
        return jsonify(category.serialize)
    except NoResultFound:
        raise InvalidUsage("Category %s not found." % categoryId)

@app.route('/api/category/<int:categoryId>/item/<int:itemId>')
def getItemJSON(categoryId, itemId):
    try:
        item = CategoryItemRepo.findById(itemId)
        return jsonify(item.serialize)
    except:
        raise InvalidUsage("Category item %s not found." % itemId)

@app.route('/api/category/<int:categoryId>/item/<int:itemId>', methods=['PUT'])
def updateItemJSON(categoryId, itemId):
    try:
        content = request.json

        if not content["title"]:
            raise InvalidUsage("Title is a required field")

        item = CategoryItemRepo.findById(itemId)
        item.id = itemId
        item.title = content["title"]
        item.categoryId = categoryId
        item.description = content["description"]

        CategoryItemRepo.createOrUpdate(item)
        return jsonify(item.serialize)
    except NoResultFound:
        raise InvalidUsage("Category item %s not found." % itemId)

@app.route('/api/category/<int:categoryId>/item/<int:itemId>', methods=['DELETE'])
def removeItemJSON(categoryId, itemId):
    try:
        item = CategoryItemRepo.findById(itemId)
        CategoryItemRepo.delete(item)
        return make_response()
    except NoResultFound:
        raise InvalidUsage("Category item %s not found" % itemId)

@app.route('/api/recent')
def getRecentJSON():
    recents = [row.serialize for row in CategoryItemRepo.findRecent()]
    return make_response(jsonify(recents), 200)
