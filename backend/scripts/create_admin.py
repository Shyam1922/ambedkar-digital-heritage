from sqlalchemy import select

from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.models import Admin


USERNAME = "admin"
PASSWORD = "admin123"


Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    existing_admin = db.scalar(
        select(Admin).where(Admin.username == USERNAME)
    )

    if existing_admin:
        print(f"Admin '{USERNAME}' already exists.")
    else:
        admin = Admin(
            username=USERNAME,
            password_hash=hash_password(PASSWORD),
        )

        db.add(admin)
        db.commit()

        print(f"Admin '{USERNAME}' created successfully.")
        