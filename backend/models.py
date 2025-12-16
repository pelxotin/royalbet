from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    bets = relationship("Bet", back_populates="user")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, index=True, nullable=True)
    team_a = Column(String, nullable=False)
    team_b = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=True)
    league = Column(String, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, live, finished
    score_a = Column(Integer, nullable=True)
    score_b = Column(Integer, nullable=True)

    bets = relationship("Bet", back_populates="match")


class Bet(Base):
    __tablename__ = "bets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    goals_a = Column(Integer, nullable=False)
    goals_b = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bets")
    match = relationship("Match", back_populates="bets")

    __table_args__ = (
        UniqueConstraint("user_id", "match_id", name="uq_user_match"),
    )



