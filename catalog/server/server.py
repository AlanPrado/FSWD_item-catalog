from config.config import config
from config.flask_config import app
from api import auth, category, category_item

if __name__ == '__main__':
    app.secret_key = config.SECRET_KEY
    app.debug = config.DEBUG
    app.run(host=config.HOST, port=config.PORT, threaded=config.DEBUG)
