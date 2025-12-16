from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class MatchBase(BaseModel):
    id: int
    team_a: str
    team_b: str
    date: str
    time: Optional[str] = None
    league: Optional[str] = None
    status: str
    score_a: Optional[int] = None
    score_b: Optional[int] = None

    class Config:
        from_attributes = True


class BetBase(BaseModel):
    match_id: int
    goals_a: int
    goals_b: int


class BetCreate(BetBase):
    pass


class BetRead(BetBase):
    id: int
    created_at: datetime
    match: MatchBase

    class Config:
        from_attributes = True


class RankingEntry(BaseModel):
    user_id: int
    email: EmailStr
    points: int



