from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, DeclarativeMeta

from config import get_settings

engine = create_async_engine(get_settings().db_uri)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base: DeclarativeMeta = declarative_base()


async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
