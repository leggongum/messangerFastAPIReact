from sqlalchemy import Integer, String, Table, ForeignKey, Column, Boolean, LargeBinary
from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

user_channel = Table('user_channel', Base.metadata,
                     Column('user_id', ForeignKey('user.id'), primary_key=True),
                     Column('channel_id', ForeignKey('channel.id'), primary_key=True))

user_privatechat = Table('user_privatechat', Base.metadata,
                         Column('user_id', ForeignKey('user.id'), primary_key=True),
                         Column('privatechat_id', ForeignKey('chat.id'), primary_key=True))


class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ = 'user'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(length=320), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(length=320), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(length=1024), nullable=False)
    created: Mapped[int] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    channel_owned: Mapped[list['Channel']] = relationship(lazy='selectin', cascade='all, delete')

    channels: Mapped[list['Channel']] = relationship(secondary=user_channel, back_populates='users', lazy='selectin')

    privatechats: Mapped[list['Chat']] = relationship(secondary=user_privatechat, back_populates='users', lazy='selectin')

    messages: Mapped[list['Message']] = relationship(lazy='selectin', cascade="all, delete")

    publickey: Mapped['PublicKey'] = relationship(lazy='selectin', cascade="all, delete-orphan", single_parent=True)


class PublicKey(Base):
    __tablename__ = 'publickey'
    user_id = mapped_column(ForeignKey('user.id'), primary_key=True)
    n: Mapped[str] = mapped_column(String(length=1024))
    e: Mapped[str] = mapped_column(String(length=16))


class Message(Base):
    __tablename__ = 'message'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    text: Mapped[bytes] = mapped_column(LargeBinary)
    date: Mapped[int] = mapped_column(Integer)

    chat_id: Mapped[int] = mapped_column(ForeignKey('chat.id'))
    chat: Mapped['Chat'] = relationship(back_populates='messages', lazy='selectin')

    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
    #user: Mapped['User'] = relationship(back_populates='user', lazy='selectin')


class Chat(Base):
    __tablename__ = 'chat'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(length=64), nullable=False)
    description: Mapped[str] = mapped_column(String(length=512))
    created: Mapped[int] = mapped_column(Integer)

    channel_id: Mapped[int] = mapped_column(ForeignKey('channel.id'), nullable=True)

    channel: Mapped['Channel'] = relationship(back_populates='chats', lazy='selectin')

    messages: Mapped[list['Message']] = relationship(back_populates='chat', lazy='selectin', cascade="all, delete-orphan")

    users: Mapped[list['User']] = relationship(secondary=user_privatechat, back_populates='privatechats', lazy='selectin')


class Channel(Base):
    __tablename__ = 'channel'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(length=64), index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(length=2048))
    created: Mapped[int] = mapped_column(Integer)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))

    chats: Mapped[list['Chat']] = relationship(lazy='selectin', cascade="all, delete-orphan")

    users: Mapped[list['User']] = relationship(secondary=user_channel, back_populates='channels', lazy='selectin')
