from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from config.config import config
from entities import Category, CategoryItem, Base

class GenericRepo:

    @staticmethod
    def __create_session__(engine):
        Base.metadata.bind = engine
        DBSession = sessionmaker(bind=engine)
        return DBSession()

    _engine = create_engine(config.DATABASE_URL)
    session = __create_session__.__func__(_engine)

    def createOrUpdate(self, entity):
        try:
            self.session.add(entity)
            self.session.commit()
        except IntegrityError as e:
            self.session.rollback()
            raise e

    def delete(self, entity):
        try:
            self.session.delete(entity)
            self.session.commit()
        except IntegrityError as e:
            self.session.rollback()
            raise e

class CategoryRepo(GenericRepo):

    def findAll(self):
        return self.session.query(Category).order_by(Category.title).all()

    def findById(self, categoryId):
        return self.session.query(Category).filter_by(id=categoryId).one()

    def findByIdWithItems(self, categoryId):
        return self.session.query(Category).filter_by(id=categoryId).outerjoin(CategoryItem, CategoryItem.categoryId==Category.id).one()

class CategoryItemRepo(GenericRepo):
    _NUMBER_OF_RECENT_ITEMS = 10

    def findById(self, itemId):
        return self.session.query(CategoryItem).filter_by(id=itemId).one()

    def findRecent(self):
        return self.session.query(CategoryItem).limit(self._NUMBER_OF_RECENT_ITEMS)

repositories = {
    "Category": CategoryRepo(),
    "Item": CategoryItemRepo()
}
