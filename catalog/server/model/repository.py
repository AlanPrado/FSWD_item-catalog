from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound

from config.config import config
from entities import Category, CategoryItem, User, Base

class GenericRepo:

    @staticmethod
    def __create_session__(engine):
        Base.metadata.bind = engine
        DBSession = sessionmaker(bind=engine)
        return scoped_session(DBSession)

    _engine = create_engine(config.DATABASE_URL)
    session = __create_session__.__func__(_engine)

    @classmethod
    def createOrUpdate(cls, entity):
        try:
            cls.session.add(entity)
            cls.session.commit()
            return entity
        except IntegrityError as e:
            cls.session.rollback()
            raise e

    @classmethod
    def delete(cls, entity):
        try:
            cls.session.delete(entity)
            cls.session.commit()
        except IntegrityError as e:
            cls.session.rollback()
            raise e

class UserRepo(GenericRepo):

    @classmethod
    def findByEmail(cls, email):
        return cls.session.query(User).filter_by(email=email).first()

class CategoryRepo(GenericRepo):

    @classmethod
    def findAll(cls):
        return cls.session.query(Category).order_by(Category.title).all()

    @classmethod
    def isOwner(cls, categoryId, userId):
        return cls.session.query(Category) \
                  .filter_by(id=categoryId, userId=userId) \
                  .first() is not None

    @classmethod
    def findById(cls, categoryId):
        return cls.session.query(Category) \
                  .filter_by(id=categoryId).one()

    @classmethod
    def findByIdWithItems(cls, categoryId):
        return cls.session.query(Category) \
                  .filter_by(id=categoryId) \
                  .outerjoin(CategoryItem, CategoryItem.categoryId==Category.id) \
                  .one()

class CategoryItemRepo(GenericRepo):
    _NUMBER_OF_RECENT_ITEMS = 10

    @classmethod
    def findById(cls, itemId):
        return cls.session.query(CategoryItem) \
                  .filter_by(id=itemId) \
                  .join(Category, Category.id==CategoryItem.categoryId) \
                  .one()

    @classmethod
    def isOwner(cls, categoryItemId, userId):
        return cls.session.query(CategoryItem) \
                  .filter_by(id=categoryItemId, userId=userId) \
                  .first() is not None

    @classmethod
    def findRecent(cls):
        return cls.session.query(CategoryItem) \
                  .order_by(CategoryItem.createdDate.desc()) \
                  .limit(cls._NUMBER_OF_RECENT_ITEMS)
