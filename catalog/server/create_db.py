from config.config import config
from model.entities import Base
from sqlalchemy import create_engine

Base.metadata.create_all(create_engine(config.DATABASE_URL))
