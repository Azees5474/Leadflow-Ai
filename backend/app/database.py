"""
LeadFlow AI - Database Initialization
Configures SQLAlchemy engine, session maker, and Base class for SQLite.
"""
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# connect_args={"check_same_thread": False} is required for SQLite in multi-threaded FastAPI
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def initialize_database():
    with engine.begin() as connection:
        if connection.dialect.name == "sqlite":
            connection.exec_driver_sql("BEGIN IMMEDIATE")
        Base.metadata.create_all(bind=connection)
        columns = inspect(connection).get_columns("leads")
        if not any(column["name"] == "email_sent_at" for column in columns):
            connection.execute(text("ALTER TABLE leads ADD COLUMN email_sent_at VARCHAR(40)"))


def get_db():
    """
    Dependency generator yielding a database session per request,
    ensuring cleanup and closure when the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
