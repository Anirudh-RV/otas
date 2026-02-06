import os

JWT_SECRET = os.getenv("JWT_SECRET", "some-jwt-secret")
JWT_VALIDITY_DAYS = int(os.getenv("JWT_VALIDITY_DAYS", 30))
