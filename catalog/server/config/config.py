import os

class Config:
    DATABASE_URL = 'postgresql://grader:@127.0.0.1/item-catalog-db'
    SECRET_KEY = "my_secret_key"
    DEBUG = True
    ENABLE_CORS = True
    ENABLE_SSL = False
    CORS_URL = 'http://localhost:9000'
    HOST = '0.0.0.0'
    PORT = 5000
    SECRETS_PATH = os.path.dirname(os.path.dirname(__file__)) +  '/client_secret.json'

class ConfigDev(Config):
    pass

class ConfigProd(Config):
    SECRET_KEY = "my_prod_secret_key"
    DEBUG = False
    CORS_URL = ''

config = ConfigProd()
