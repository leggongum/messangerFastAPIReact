from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound

from time import time

from crypto.crypt_fernet import encrypt, decrypt
from auth.curr_user import current_user, User
from auth.schemas import UserRead
from channel.schemas import (ChannelCreate, ChannelRead, ChannelUpdate, ChannelDelete, ChannelUser,
                             ChatCreate, ChatRead, ChatSimpleRead, ChatUpdate, ChatDelete,
                             MessageCreate, MessageRead, MessageUpdate, MessageDelete)
from models import Channel, Chat, Message
from database import get_session


router = APIRouter(
    prefix='/channels',
    tags=['Channels'],
)

### Channel CRUD ###


@router.post('/add_user', response_model=UserRead)
async def add_user_to_channel(data: ChannelUser,
                            session: AsyncSession = Depends(get_session),
                            user = Depends(current_user)):
    channel = await session.get(Channel, data.channel_id)
    if channel not in user.channels:
        raise HTTPException(status_code=403, detail="You must be in channel to add another user!")
    target_user = await session.get(User, data.user_id)
    if target_user is None:
        raise HTTPException(status_code=404, detail="This user is not exist!")
    if  channel in target_user.channels:
        raise HTTPException(status_code=403, detail="This user is already in channel!")
    
    target_user.channels.append(channel)
    session.add(target_user)
    await session.commit()
    return target_user


@router.post('/delete_user')
async def delete_user_from_channel(data: ChannelUser,
                            session: AsyncSession = Depends(get_session),
                            user = Depends(current_user)):
    channel = await session.get(Channel, data.channel_id)
    target_user = await session.get(User, data.user_id)

    if target_user is None:
        raise HTTPException(status_code=404, detail="This user is not exist!")
    
    if channel not in user.channel_owned and user != target_user:
        raise HTTPException(status_code=403, detail="You must be channel owner to delete another user!")
    
    if  channel not in target_user.channels:
        raise HTTPException(status_code=403, detail="This user is not in the channel!")
    
    target_user.channels.remove(channel)
    session.add(target_user)
    await session.commit()
    return {'description': 'The user was deleted from channel'}


#@router.get('/', response_model=list[tuple[ChannelRead]])
#async def get_channels(session: AsyncSession = Depends(get_session)):
#    query = select(Channel).limit(10)
#    res = (await session.execute(query)).all()
#    return res


@router.get('/channel', response_model=ChannelRead)
async def get_channel(channel_id: int,
                      session: AsyncSession = Depends(get_session),
                      user = Depends(current_user)):
  
    query = select(Channel).where(Channel.id == channel_id).options(selectinload(Channel.chats), selectinload(Channel.users))
    try:
        channel = (await session.execute(query)).one()
    except NoResultFound:
        raise HTTPException(status_code=403, detail="You can't do that!")
    if user not in channel[0].users:
        raise HTTPException(status_code=403, detail="You can't do that!")
  
    return channel[0]


@router.post('/create', response_model=ChannelRead)
async def create_channel(data: ChannelCreate, 
                         user: User = Depends(current_user), 
                         session: AsyncSession = Depends(get_session)):
    new_channel = Channel(title=data.title, description=data.description, created=round(time()), user_id=user.id, chats=[])
    new_channel.users.append(user)
    session.add(new_channel)
    await session.commit()
    return new_channel


@router.put('/')
async def update_channel(data: ChannelUpdate, 
                         user: User = Depends(current_user), 
                         session: AsyncSession = Depends(get_session)):
    stmt = update(Channel).where(Channel.id == data.id).where(Channel.user_id == user.id).values(title=data.title, description=data.description)
    try:
        await session.execute(stmt)
        await session.commit()
    except Exception as e:
        await session.rollback()
        print(e)
        raise
    else:
        return {'description': 'The channel was update'}


@router.delete('/')
async def delete_channel(data: ChannelDelete, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)):
    channel = await session.get(Channel, data.id)

    if user.id != channel.user_id:
        raise HTTPException(status_code=403, detail="You can't do that!")

    await session.delete(channel)
    await session.commit()

    '''
    stmt = delete(Channel).where(Channel.id == data.id).where(Channel.user_id == user.id)
    try:
        await session.execute(stmt)
        await session.commit()
    except Exception as e:
        await session.rollback()
        print(e)
        raise
    else:
        return {'description': 'The channel was delete'}
    '''


### Chat CRUD ###


async def can_user_CrUD_chat_in_this_channel(user, session, channel_id):
    channel = await session.get(Channel, channel_id)
    return channel in user.channel_owned


@router.get('/chats', response_model=list[ChatSimpleRead])
async def get_chats_by_channel(channel_id: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)):
    channel = await session.get(Channel, channel_id)
    if channel not in user.channels:
        raise HTTPException(status_code=403, detail="You can't do that!")
    query = select(Chat).where(Chat.channel_id == channel_id)
    try:
        res = (await session.execute(query)).all()
    except Exception as e:
        print(e)
        raise
    return [r[0] for r in res]


@router.get('/chat', response_model=ChatRead)
async def get_chat_by_id(chat_id: int, 
                         user: User = Depends(current_user), 
                         session: AsyncSession = Depends(get_session)):
    chat = await session.get(Chat, chat_id, options=selectinload(Chat.users, recursion_depth=2))
    if chat.channel_id:
        channel = await session.get(Channel, chat.channel_id)
        if channel not in user.channels:
            raise HTTPException(status_code=403, detail="You can't do that!")
        messages = chat.messages[-1:-11:-1]
        decrypt_messages = []
        for msg in messages:
            message = msg
            message.text = decrypt(message.text).decode('utf8')
            decrypt_messages.append(message)
        chat.messages = decrypt_messages
        return chat
    elif chat not in user.privatechats:
        raise HTTPException(status_code=403, detail="You can't do that!")
    messages = chat.messages[-1:-100:-1]
    decrypt_messages = []
    for msg in messages:
        message = msg
        message.text = decrypt(message.text).decode('ISO-8859-1')
        decrypt_messages.append(message)
    chat.messages = decrypt_messages
    return chat


@router.post('/create_chat', response_model=ChatRead)
async def create_chat(data: ChatCreate, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)):
    if not await can_user_CrUD_chat_in_this_channel(user, session, data.channel_id):
        raise HTTPException(status_code=403, detail="You can't do that!")

    new_chat = Chat(title=data.title, description=data.description, created=round(time()), channel_id=data.channel_id, messages=[])
    session.add(new_chat)
    await session.commit()
    return new_chat


@router.put('/chat')
async def update_chat(data: ChatUpdate, 
                      user: User = Depends(current_user), 
                      session: AsyncSession = Depends(get_session)):
    chat = await session.get(Chat, data.id)

    if not await can_user_CrUD_chat_in_this_channel(user, session, chat.channel_id):
        raise HTTPException(status_code=403, detail="You can't do that!")

    stmt = update(Chat).where(Chat.id == data.id).values(title=data.title, description=data.description)
    try:
        await session.execute(stmt)
        await session.commit()
    except Exception as e:
        await session.rollback()
        print(e)
        raise
    else:
        return {'description': 'The chat was update'}


@router.delete('/chat')
async def delete_chat(data: ChatDelete, 
                      user: User = Depends(current_user), 
                      session: AsyncSession = Depends(get_session)):
    chat = await session.get(Chat, data.id)
    if not await can_user_CrUD_chat_in_this_channel(user, session, chat.channel_id):
        raise HTTPException(status_code=403, detail="You can't do that!")
    
    await session.delete(chat)
    await session.commit()
    return {'description': 'The chat was delete'}

    '''
    ### Bad case <= no cascade
    stmt = delete(Chat).where(Chat.id == data.id)
    try:
        await session.execute(stmt)
        await session.commit()
    except Exception as e:
        await session.rollback()
        print(e)
        raise
    else:
        return {'description': 'The chat was delete'}
    '''


### Message CRUD ###

async def can_user_CR_message_in_this_channel(user, session, channel_id):
    channel = await session.get(Channel, channel_id)
    return channel in user.channels


async def can_user_UD_message(user, session, message_id):
    message = await session.get(Message, message_id)
    return message in user.messages


@router.get('/messages', response_model=list[MessageRead])
async def get_messages_in_this_chat(chat_id: int, limit=Query(default=10, lte=100), offset: int = 0,
                                    user: User = Depends(current_user),
                                    session: AsyncSession = Depends(get_session)):
    chat = await session.get(Chat, chat_id)
    if not await can_user_CR_message_in_this_channel(user, session, chat.channel_id):
        raise HTTPException(status_code=403, detail="You can't do that!")
    query = select(Message).where(Message.chat_id==chat_id).order_by(Message.id.desc()).offset(offset).limit(limit)
    messages = (await session.execute(query)).all()
    decrypt_messages = []
    for msg in messages:
        message = msg[0]
        message.text = decrypt(message.text).decode('utf8')
        decrypt_messages.append(message)
    return decrypt_messages #chat.messages


@router.post('/create_message', response_model=MessageRead)
async def create_message(message: MessageCreate,
                         user: User = Depends(current_user),
                         session: AsyncSession = Depends(get_session)):
    chat = await session.get(Chat, message.chat_id)
    if not await can_user_CR_message_in_this_channel(user, session, chat.channel_id):
        raise HTTPException(status_code=403, detail="You can't do that!")

    new_message = Message(text=encrypt(message.text.encode('utf8')), date=round(time()), chat_id=message.chat_id, user_id=user.id)
    session.add(new_message)
    await session.commit()
    return new_message


@router.put('/message')
async def update_message(message: MessageUpdate,
                         user: User = Depends(current_user),
                         session: AsyncSession = Depends(get_session)):
    if not await can_user_UD_message(user, session, message.id):
        raise HTTPException(status_code=403, detail="You can't do that!")

    stmt = update(Message).where(Message.id == message.id).values(text=encrypt(message.text.encode('utf8')))
    try:
        await session.execute(stmt)
        await session.commit()
    except Exception as e:
        await session.rollback()
        print(e)
        raise
    else:
        return {'description': 'The message was update'}


@router.delete('/message')
async def delete_message(message: MessageDelete,
                         user: User = Depends(current_user),
                         session: AsyncSession = Depends(get_session)):
    if not await can_user_UD_message(user, session, message.id):
        raise HTTPException(status_code=403, detail="You can't do that!")

    stmt = delete(Message).where(Message.id == message.id)
    try:
        await session.execute(stmt)
        await session.commit()
    except Exception as e:
        await session.rollback()
        print(e)
        raise
    else:
        return {'description': 'The message was delete'}
