from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth_utils import get_current_user


router = APIRouter()


@router.post("/", response_model=schemas.BetRead)
def create_bet(
    bet_in: schemas.BetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    match = db.query(models.Match).get(bet_in.match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Jogo não encontrado"
        )

    existing = (
        db.query(models.Bet)
        .filter(
            models.Bet.user_id == current_user.id,
            models.Bet.match_id == bet_in.match_id,
        )
        .first()
    )
    if existing:
        # Atualiza palpite existente
        existing.goals_a = bet_in.goals_a
        existing.goals_b = bet_in.goals_b
        db.commit()
        db.refresh(existing)
        return existing

    bet = models.Bet(
        user_id=current_user.id,
        match_id=bet_in.match_id,
        goals_a=bet_in.goals_a,
        goals_b=bet_in.goals_b,
    )
    db.add(bet)
    db.commit()
    db.refresh(bet)
    return bet


@router.get("/me", response_model=List[schemas.BetRead])
def list_my_bets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    bets = (
        db.query(models.Bet)
        .filter(models.Bet.user_id == current_user.id)
        .order_by(models.Bet.created_at.desc())
        .all()
    )
    return bets



