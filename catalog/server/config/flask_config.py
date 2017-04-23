import os
import json

from flask_cors import CORS, cross_origin
from flask import Flask, jsonify

from config import config
from exception.exception_helper import InvalidUsage

class FlaskConfigutation():

    @staticmethod
    def __enableCors__(app):
        if config.ENABLE_CORS:
            CORS(app, resources={r"/api/*": {"origins": config.CORS_URL}}, supports_credentials=True)
            app.config['CORS_HEADERS'] = 'Content-Type'

    @staticmethod
    def __configureJinja__(app):
        """
            Once angular interpolation operator is equals to jinja
            expression operator, this could lead to a conflict.
            This configuration allow jinja and angular work together.
        """
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

    @staticmethod
    def __initialize__():
        base_dir = os.path.abspath(os.path.dirname(__file__))
        template_dir = os.path.join(base_dir, 'static')
        return Flask(__name__,
                     template_folder=template_dir,
                     static_folder=template_dir,
                     static_url_path="")

    app = __initialize__.__func__()
    __enableCors__.__func__(app)
    __configureJinja__.__func__(app)

    @staticmethod
    def getClientId():
        # TODO: remove
        client_secret = open('../client_secret.json', 'r').read()
        return json.loads(client_secret)['web']['client_id']

    @staticmethod
    @app.errorhandler(InvalidUsage)
    def handleInvalidUsage(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        if config.ENABLE_CORS:
            response.headers["Access-Control-Allow-Origin"] = config.CORS_URL
            response.headers["Access-Control-Allow-Credentials"] = 'true'
        return response

app = FlaskConfigutation().app
