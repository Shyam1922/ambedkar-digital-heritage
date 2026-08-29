from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.admin import router as admin_router
from app.api.kiosk import router as kiosk_router

from app.core.config import settings
from app.db.database import Base, SessionLocal, engine
from app.services.seed import seed_database

import app.models


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        seed_database(db)

    yield


app = FastAPI(
    title="Ambedkar Digital Heritage Archive API",
    version="0.1.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Public archive routes
app.include_router(router)

# Admin routes
app.include_router(admin_router)

# Kiosk routes
app.include_router(kiosk_router)