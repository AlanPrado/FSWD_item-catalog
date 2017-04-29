class Config:
    DATABASE_URL = 'sqlite:////vagrant/catalog/database/catalog.db'
    SECRET_KEY = "my_secret_key"
    DEBUG = True
    ENABLE_CORS = True
    ENABLE_SSL = False
    CORS_URL = 'http://localhost:9000'
    HOST = '0.0.0.0'
    PORT = 5000

class ConfigDev(Config):
    pass

class ConfigProd(Config):
    SECRET_KEY = "my_prod_secret_key"
    DEBUG = False
    CORS_URL = ''

config = ConfigProd()
