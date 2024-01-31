from cryptography.fernet import Fernet
from config import get_settings


f = Fernet(get_settings().crypt_key)


def encrypt(message: bytes) -> bytes:
    return f.encrypt(message)


def decrypt(message: bytes) -> bytes:
    return f.decrypt(message)


