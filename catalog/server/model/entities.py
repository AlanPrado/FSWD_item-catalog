import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Category(Base):
    __tablename__ = 'category'

    id = Column(Integer, primary_key=True)
    title = Column(String(250), nullable=False)
    items = relationship('CategoryItem', backref='categoryItem', lazy='dynamic')

    __table_args__ = (UniqueConstraint('title', name='uk_cat_title'),)

    @property
    def serialize(self):
        s = {
            "id": self.id,
            "title": self.title,
            "items": []
        }
        for i in self.items:
            s["items"].append((i.serializeShortVersion))

        print s
        return s

class CategoryItem(Base):
    __tablename__ = 'category_item'

    id = Column(Integer, primary_key=True)
    title = Column(String(80), nullable=False)
    description = Column(String(250))
    categoryId = Column(Integer, ForeignKey('category.id'))
    createdDate = Column(DateTime, default=datetime.datetime.utcnow)
    category = relationship(Category)

    @property
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "categoryId": self.categoryId,
            #"categoryTitle": self.category.title,
            "createdDate": self.createdDate
        }

    @property
    def serializeShortVersion(self):
        return {
            "id": self.id,
            "title": self.title,
        }
