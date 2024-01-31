from fastapi_users import FastAPIUsers

from auth.manager import get_user_manager
from auth.transport_strategy import auth_backend
from models import User

fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

#current_user = fastapi_users.current_user()

current_user = fastapi_users.current_user(verified=True)

current_not_verified_user = fastapi_users.current_user()
