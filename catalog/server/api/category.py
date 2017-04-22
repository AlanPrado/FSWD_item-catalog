import json

from flask import request, make_response, jsonify

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound

from config.flask_config import app
from model.entities import Category
from model.repository import CategoryRepo
from exception.exception_helper import InvalidUsage

@app.route('/api/category', methods=['POST'])
def addCategoryJSON():
    content = request.json
    try:
        category = Category(title=content["title"])
        CategoryRepo.createOrUpdate(category)
        return jsonify(category.serialize)
    except IntegrityError:
        raise InvalidUsage("There is another category with title '%s'." % content["title"])

@app.route('/api/category/<int:categoryId>')
def getCategoryJSON(categoryId):
    try:
        result = CategoryRepo.findByIdWithItems(categoryId)
        return jsonify(result.serialize)
    except NoResultFound:
        raise InvalidUsage("No category found")

@app.route('/api/category/<int:categoryId>', methods=['PUT'])
def updateCategoryJSON(categoryId):
    content = request.json
    try:
        category = CategoryRepo.findById(categoryId)
        category.title = content["title"]
        CategoryRepo.createOrUpdate(category)
        return jsonify(category.serialize)
    except NoResultFound:
        raise InvalidUsage("Category %s not found." % categoryId)
    except IntegrityError:
        raise InvalidUsage("There is another category with title '%s'." % content["title"])

@app.route('/api/category/<int:categoryId>', methods=['DELETE'])
def removeCategoryJSON(categoryId):
    try:
        category = CategoryRepo.findById(categoryId)
        CategoryRepo.delete(category)
        return make_response()
    except NoResultFound:
        raise InvalidUsage("Category %s not found" % categoryId)

@app.route('/api/categories')
def getAllCategoriesJSON():
    categories = [row.serialize for row in CategoryRepo.findAll()]
    response = make_response(json.dumps(categories), 200)
    response.headers["Content-Type"] = "application/json"
    return response
