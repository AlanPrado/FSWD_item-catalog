class Config:
    DATABASE_URL='sqlite:////vagrant/catalog/database/catalog.db'
    SECRET_KEY="my_secret_key"
    DEBUG=True
    HOST='0.0.0.0'
    PORT=5000

class ConfigDev(Config):
    pass

class ConfigProd(Config):
    SECRET_KEY="my_prod_secret_key"
    DEBUG=False

config = ConfigDev()
