from fastapi import FastAPI, Depends, status, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.schemas import UserRead, UserCreate, UserUpdate
from auth.transport_strategy import auth_backend
from auth.curr_user import current_user, fastapi_users, current_not_verified_user
from channel.route import router as channel_router
from websocket.route import router as ws_router
from privatechat.route import router as priv_router
from models import User
from database import get_session
from schemas import StartPage


app = FastAPI(title='Messanger')


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["POST", "GET", "PUT", "DELETE", "PATCH", "OPTIONS",],
    allow_headers=["Access-Control-Allow-Origin", 
                   "Access-Control-Allow-Headers", 
                   "Content-Type", "Set-Cookie", 
                   "Autorization", 
                   'Access-Control-Allow-Credentials', 
                   'Access-Control-Allow-Methods'],
)


app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

@app.delete("/users/me", status_code=204)
async def delete_me(user: User = Depends(current_not_verified_user),
                    session: AsyncSession = Depends(get_session)):
    await session.delete(user)
    await session.commit()
    return None

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(channel_router)
app.include_router(ws_router)
app.include_router(priv_router)

@app.get('/')
async def hello():
    return 'Hello!!'


@app.get('/get_users', response_model=list[tuple[UserRead]], dependencies=[Depends(current_user)])
async def get_users(session: AsyncSession = Depends(get_session)):
    query = select(User).limit(10)
    res = (await session.execute(query)).all()
    return res


@app.get('/get_start_page', response_model=StartPage)
async def get_start_page(user: User = Depends(current_user),):
  return {'user': user, 'channels': user.channels}
