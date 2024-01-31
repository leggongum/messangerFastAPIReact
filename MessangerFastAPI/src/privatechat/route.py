from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from time import time

from auth.curr_user import current_user
from privatechat.schemas import PublicKeyCreate, PrivateChatCreate, PrivateChatRead, PrivateChatSimpleRead, PublicKeyRead, PrivateChatsAsObj
from database import get_session
from models import PublicKey, Chat, Message, User


router = APIRouter(
    prefix='/priv',
    tags=['PrivateChat'],
)


@router.post('/new_pub')
async def save_new_public_key(pub: PublicKeyCreate,
                              user: User = Depends(current_user),
                              session: AsyncSession = Depends(get_session)):
    if not user.publickey:
        new_pub = PublicKey(e=str(pub.e), n=str(pub.n), user_id=user.id)
        session.add(new_pub)
        await session.commit()
        return {'description': 'The public key was save'}
    stmt = update(PublicKey).where(PublicKey.user_id == user.id).values(e=str(pub.e), n=str(pub.n))
    await session.execute(stmt)
    await session.commit()
    return {'description': 'The public key was save'}


@router.post('/', response_model=PrivateChatRead)
async def create_privatechat(target_user_id: int, chat: PrivateChatCreate,
                             user: User = Depends(current_user),
                             session: AsyncSession = Depends(get_session)):
    if not user.publickey:
        raise HTTPException(status_code=403, detail="You haven't public key! Generate one to use private chats.")
    target_user = await session.get(User, target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="This user is not exist.")

    new_chat = Chat(title=chat.title, description=chat.description, created=int(time()), messages=[])
    new_chat.users.append(user)
    new_chat.users.append(target_user)
    session.add(new_chat)
    await session.commit()

    return new_chat


@router.post('/get_pubkey', response_model=PublicKeyRead)
async def get_public_key(target_user_id: int,
                             user: User = Depends(current_user),
                             session: AsyncSession = Depends(get_session)):
    return await session.get(PublicKey, target_user_id)
  

@router.get('/private_chats', response_model=PrivateChatsAsObj)
async def get_private_chats(user: User = Depends(current_user)):
    return {'chats': user.privatechats, 'users': []}