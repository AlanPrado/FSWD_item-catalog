from config.config import config
from config.flask_config import app
from model.entities import db
from api import auth, category, category_item

app.secret_key = config.SECRET_KEY
app.debug = config.DEBUG

app.config['SQLALCHEMY_DATABASE_URI'] = config.DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

if __name__ == '__main__':
    app.run(host=config.HOST, port=config.PORT, threaded=config.DEBUG)
