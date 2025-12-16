from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db


router = APIRouter()


def calculate_points(match: models.Match, bet: models.Bet) -> int:
    if match.score_a is None or match.score_b is None:
        return 0

    # placar exato
    if bet.goals_a == match.score_a and bet.goals_b == match.score_b:
        return 5

    result_match = (
        "A" if match.score_a > match.score_b else "B" if match.score_b > match.score_a else "D"
    )
    result_bet = (
        "A" if bet.goals_a > bet.goals_b else "B" if bet.goals_b > bet.goals_a else "D"
    )

    if result_match == result_bet:
        return 3

    if bet.goals_a == match.score_a or bet.goals_b == match.score_b:
        return 1

    return 0


@router.get("/", response_model=List[schemas.RankingEntry])
def get_ranking(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    matches_by_id = {m.id: m for m in db.query(models.Match).all()}
    bets = db.query(models.Bet).all()

    points_by_user: dict[int, int] = {u.id: 0 for u in users}

    for bet in bets:
        match = matches_by_id.get(bet.match_id)
        if not match:
            continue
        points_by_user[bet.user_id] = points_by_user.get(bet.user_id, 0) + calculate_points(
            match, bet
        )

    ranking = [
        schemas.RankingEntry(user_id=u.id, email=u.email, points=points_by_user.get(u.id, 0))
        for u in users
    ]

    ranking.sort(key=lambda x: x.points, reverse=True)
    return ranking



