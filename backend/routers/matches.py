from typing import List, Optional
import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import httpx
from dotenv import load_dotenv

from .. import models, schemas
from ..database import get_db


load_dotenv()

router = APIRouter()

FOOTBALL_API_BASE_URL = os.getenv("FOOTBALL_API_BASE_URL")
FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY")


async def fetch_external_matches() -> list[dict]:
    """
    Exemplo genérico de chamada a uma API de futebol.
    Ajuste a URL, headers e mapeamento conforme o provedor real que você usar.
    """
    if not FOOTBALL_API_BASE_URL or not FOOTBALL_API_KEY:
        return []

    url = f"{FOOTBALL_API_BASE_URL}/matches"
    headers = {"x-api-key": FOOTBALL_API_KEY}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", data)


def map_external_to_match(item: dict) -> models.Match:
    return models.Match(
        external_id=str(item.get("id") or item.get("fixture_id") or ""),
        team_a=item.get("home_team", {}).get("name")
        or item.get("homeTeam")
        or "Time A",
        team_b=item.get("away_team", {}).get("name")
        or item.get("awayTeam")
        or "Time B",
        date=str(item.get("date") or item.get("match_date") or ""),
        time=str(item.get("hour") or item.get("time") or ""),
        league=item.get("league", {}).get("name")
        or item.get("competition", {}).get("name")
        or item.get("tournament")
        or "Campeonato",
        status=item.get("status") or "scheduled",
        score_a=item.get("home_score"),
        score_b=item.get("away_score"),
    )


@router.get("/", response_model=List[schemas.MatchBase])
async def list_matches(db: Session = Depends(get_db)):
    """
    Retorna a lista de jogos.
    - Se a API externa estiver configurada, sincroniza alguns jogos antes.
    - Caso contrário, usa apenas o que estiver salvo no banco (você pode popular via script/admin).
    """
    external_matches: Optional[list[dict]] = None
    try:
        external_matches = await fetch_external_matches()
    except Exception:
        external_matches = None

    if external_matches:
        existing_by_external = {
            m.external_id: m
            for m in db.query(models.Match).filter(models.Match.external_id.isnot(None))
        }
        for item in external_matches[:50]:  # evita estourar limites de API
            ext_id = str(item.get("id") or item.get("fixture_id") or "")
            if not ext_id:
                continue
            if ext_id in existing_by_external:
                m = existing_by_external[ext_id]
                m.status = item.get("status") or m.status
                m.score_a = item.get("home_score", m.score_a)
                m.score_b = item.get("away_score", m.score_b)
            else:
                db.add(map_external_to_match(item))
        db.commit()

    matches = db.query(models.Match).order_by(models.Match.date, models.Match.time).all()
    return matches



