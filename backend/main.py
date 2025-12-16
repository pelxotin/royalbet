from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, matches, bets, ranking


app = FastAPI(title="RoyalBet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em produção, restrinja para o domínio do seu front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def read_root():
    return {"status": "ok", "service": "royalbet-api"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(matches.router, prefix="/matches", tags=["matches"])
app.include_router(bets.router, prefix="/bets", tags=["bets"])
app.include_router(ranking.router, prefix="/ranking", tags=["ranking"])



