// ==================
// Configuração RoyalBet
// ==================

// BACKEND ROYALBET
// Altere BASE_API_URL para o endereço do backend FastAPI quando estiver online (Render, Railway, etc.)
const BASE_API_URL = "http://localhost:8000"; // ex.: "https://royalbet-api.onrender.com"

// ==================
// Estado global
// ==================

const state = {
  user: null,
  matches: [], // {id, teamA, teamB, date, time, status, scoreA, scoreB, league}
  ranking: [],
  bets: [], // {id, user, matchId, palpite, createdAt}
  competitions: [],
  token: null,
};

// ==================
// Elementos da UI
// ==================

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authSection = document.getElementById("authSection");
const dashboard = document.getElementById("dashboard");
const matchesList = document.getElementById("matchesList");
const rankingList = document.getElementById("rankingList");
const betForm = document.getElementById("betForm");
const matchSelect = document.getElementById("matchSelect");
const scoreA = document.getElementById("scoreA");
const scoreB = document.getElementById("scoreB");
const currentUserLabel = document.getElementById("currentUserLabel");
const logoutBtn = document.getElementById("logoutBtn");
const betsList = document.getElementById("betsList");
const competitionFilter = document.getElementById("competitionFilter");
const newsList = document.getElementById("newsList");
const yearSpan = document.getElementById("currentYear");
const heroSlides = document.querySelectorAll(".rb-hero-slide");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const toastContainer = document.getElementById("toastContainer");
const statsTotalBetsEl = document.getElementById("statsTotalBets");
const statsUserBetsEl = document.getElementById("statsUserBets");
const statsUniqueMatchesEl = document.getElementById("statsUniqueMatches");
const statsTopLeagueEl = document.getElementById("statsTopLeague");
const authTabs = document.querySelectorAll(".rb-auth-tab");
const authPanes = document.querySelectorAll(".rb-auth-pane");

// Mock inicial para dev (caso API não esteja configurada)
const MOCK_MATCHES = [
  {
    id: 1,
    teamA: "Brasil",
    teamB: "Alemanha",
    date: "12/06/2025",
    time: "16:00",
    status: "scheduled",
    scoreA: null,
    scoreB: null,
    league: "Amistoso Internacional",
  },
  {
    id: 2,
    teamA: "Palmeiras",
    teamB: "Boca Juniors",
    date: "01/07/2025",
    time: "21:30",
    status: "scheduled",
    scoreA: null,
    scoreB: null,
    league: "Libertadores",
  },
];

const MOCK_RANKING = [
  { user: "Pedro", points: 12 },
  { user: "Ana", points: 9 },
  { user: "João", points: 7 },
];

const MOCK_NEWS = [
  {
    id: 1,
    title: "Clássico decisivo movimenta rodada do Brasileirão",
    league: "Brasileirão",
    thumb:
      "https://images.pexels.com/photos/2744229/pexels-photo-2744229.jpeg",
    source: "Notícias RoyalBet",
    publishedAt: "Hoje",
  },
  {
    id: 2,
    title: "Times europeus se preparam para a próxima temporada",
    league: "Futebol Europeu",
    thumb:
      "https://images.pexels.com/photos/995764/pexels-photo-995764.jpeg",
    source: "Notícias RoyalBet",
    publishedAt: "Hoje",
  },
  {
    id: 3,
    title: "Mercado da bola pega fogo com novas contratações",
    league: "Mercado da Bola",
    thumb:
      "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg",
    source: "Notícias RoyalBet",
    publishedAt: "Ontem",
  },
];

// ==================
// Utilidades gerais
// ==================

function setCurrentYear() {
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function formatMatchDate(date, time) {
  return time ? `${date} • ${time}` : date;
}

// ==================
// Armazenamento local (simula "salvar usuários online" neste navegador)
// ==================

const STORAGE_KEY = "royalbet_state_v1";
const THEME_STORAGE_KEY = "royalbet_theme_v1";

function saveToStorage() {
  const payload = {
    user: state.user,
    bets: state.bets,
    token: state.token,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    const parsed = JSON.parse(data);
    state.user = parsed.user || null;
    state.bets = parsed.bets || [];
    state.token = parsed.token || null;
  } catch {
    // ignore
  }
}

function loadThemeFromStorage() {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    if (!theme) return;
    document.body.classList.toggle("rb-light", theme === "light");
    updateThemeToggleLabel();
  } catch {
    // ignore
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("rb-light");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isLight ? "light" : "dark");
  } catch {
    // ignore
  }
  updateThemeToggleLabel();
}

function updateThemeToggleLabel() {
  if (!themeToggleBtn) return;
  const isLight = document.body.classList.contains("rb-light");
  themeToggleBtn.textContent = isLight ? "Modo escuro" : "Modo claro";
}

// ==================
// Carrossel (troca a cada 5 segundos)
// ==================

function initHeroCarousel() {
  if (!heroSlides || heroSlides.length === 0) return;
  let current = 0;

  setInterval(() => {
    heroSlides[current].classList.remove("active");
    current = (current + 1) % heroSlides.length;
    heroSlides[current].classList.add("active");
  }, 5000);
}

// ==================
// Toasts / feedback visual
// ==================

function showToast(message, type = "success") {
  if (!toastContainer) {
    alert(message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = `rb-toast rb-toast-${type}`;

  const msg = document.createElement("div");
  msg.className = "rb-toast-message";
  msg.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.className = "rb-toast-close";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => removeToast(toast));

  toast.appendChild(msg);
  toast.appendChild(closeBtn);
  toastContainer.appendChild(toast);

  setTimeout(() => removeToast(toast), 3500);
}

function removeToast(toast) {
  if (!toast) return;
  toast.style.animation = "rb-toast-out 0.2s ease forwards";
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 200);
}

// ==================
// API RoyalBet (FastAPI) + fallback para mock
// ==================

async function apiFetch(path, options = {}) {
  const url = `${BASE_API_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const config = { ...options, headers };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      throw new Error(`Erro na API: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Falha ao chamar backend, usando fallback local:", err);
    throw err;
  }
}

async function fetchMatchesFromApi() {
  try {
    const data = await apiFetch("/matches");
    state.matches = (data || []).map((item, index) => ({
      id: item.id ?? index + 1,
      teamA: item.team_a ?? "Time A",
      teamB: item.team_b ?? "Time B",
      date: item.date ?? "Data",
      time: item.time ?? "",
      status: item.status ?? "scheduled",
      scoreA: item.score_a ?? null,
      scoreB: item.score_b ?? null,
      league: item.league ?? "Campeonato",
    }));
  } catch {
    // fallback mock
    state.matches = MOCK_MATCHES;
  }

  state.competitions = Array.from(
    new Set(state.matches.map((m) => m.league))
  );
}

// ==================
// Renderização
// ==================

function renderMatches() {
  if (!matchesList) return;

  const filterValue = competitionFilter?.value || "all";

  const grouped = state.matches.reduce((acc, match) => {
    const league = match.league || "Outros";
    if (!acc[league]) acc[league] = [];
    acc[league].push(match);
    return acc;
  }, {});

  const leagueNames = Object.keys(grouped).sort();

  const html = leagueNames
    .filter((league) => filterValue === "all" || filterValue === league)
    .map((league) => {
      const matchesHtml = grouped[league]
        .map((m) => {
          let statusClass = "rb-match-status-scheduled";
          if (m.status === "live") statusClass = "rb-match-status-live";
          if (m.status === "finished") statusClass = "rb-match-status-finished";

          const scoreText =
            m.scoreA != null && m.scoreB != null
              ? `${m.scoreA} x ${m.scoreB}`
              : "x";

          return `<li>
              <div><strong>${m.teamA}</strong> ${scoreText} <strong>${m.teamB}</strong></div>
              <div class="rb-match-meta">
                <span>${formatMatchDate(m.date, m.time)}</span>
                <span class="${statusClass}">${
            m.status === "live"
              ? "Ao vivo"
              : m.status === "finished"
              ? "Encerrado"
              : "Agendado"
          }</span>
              </div>
            </li>`;
        })
        .join("");

      return `
        <div>
          <div class="rb-match-group-title">${league}</div>
          <ul class="list">
            ${matchesHtml}
          </ul>
        </div>
      `;
    })
    .join("");

  matchesList.innerHTML = html || "<p>Nenhum jogo disponível.</p>";
}

function renderMatchSelect() {
  if (!matchSelect) return;

  const options = [
    `<option value="" disabled selected>Selecione um jogo</option>`,
    ...state.matches.map(
      (m) =>
        `<option value="${m.id}">${m.teamA} vs ${m.teamB} (${formatMatchDate(
          m.date,
          m.time
        )})</option>`
    ),
  ];

  matchSelect.innerHTML = options.join("");
}

function renderRanking() {
  if (!rankingList) return;

  const rankingToRender = state.ranking.length ? state.ranking : [];

  if (!rankingToRender.length) {
    rankingList.innerHTML =
      '<li><span>O ranking será atualizado assim que houver resultados de partidas.</span></li>';
    return;
  }

  rankingList.innerHTML = rankingToRender
    .map(
      (r, i) =>
        `<li>
          <span>#${i + 1} — ${r.email}</span>
          <span>${r.points} pts</span>
        </li>`
    )
    .join("");
}

function renderBets() {
  if (!betsList) return;

  const userBets = state.bets.filter((b) => b.user === state.user);

  if (!userBets.length) {
    betsList.innerHTML =
      '<li><span>Nenhum palpite registrado ainda.</span></li>';
    return;
  }

  betsList.innerHTML = userBets
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10)
    .map(
      (b) =>
        `<li>
          <div>${b.palpite}</div>
          <div class="rb-match-meta"><span>${new Date(
            b.createdAt
          ).toLocaleString()}</span></div>
        </li>`
    )
    .join("");
}

function renderStats() {
  if (!statsTotalBetsEl || !statsUserBetsEl || !statsUniqueMatchesEl || !statsTopLeagueEl) {
    return;
  }

  const totalBets = state.bets.length;
  const userBets = state.user
    ? state.bets.filter((b) => b.user === state.user).length
    : 0;
  const uniqueMatches = new Set(state.bets.map((b) => b.matchId)).size;

  const leagueCount = state.matches.reduce((acc, m) => {
    const league = m.league || "Outros";
    acc[league] = (acc[league] || 0) + 1;
    return acc;
  }, {});

  const topLeague =
    Object.keys(leagueCount).length === 0
      ? "-"
      : Object.entries(leagueCount).sort((a, b) => b[1] - a[1])[0][0];

  statsTotalBetsEl.textContent = String(totalBets);
  statsUserBetsEl.textContent = String(userBets);
  statsUniqueMatchesEl.textContent = String(uniqueMatches);
  statsTopLeagueEl.textContent = topLeague;
}

function renderCompetitionsFilter() {
  if (!competitionFilter) return;

  const options = [
    `<option value="all">Todos os campeonatos</option>`,
    ...state.competitions
      .slice()
      .sort()
      .map((c) => `<option value="${c}">${c}</option>`),
  ];

  competitionFilter.innerHTML = options.join("");
}

function renderNews() {
  if (!newsList) return;

  newsList.innerHTML = MOCK_NEWS.map(
    (n) => `
      <article class="rb-news-card">
        <div class="rb-news-thumb" style="background-image: url('${n.thumb}');"></div>
        <div class="rb-news-body">
          <div class="rb-news-meta">${n.league} • ${n.publishedAt}</div>
          <div class="rb-news-title">${n.title}</div>
          <div class="rb-news-footer">${n.source}</div>
        </div>
      </article>
    `
  ).join("");
}

// ==================
// Login / Logout
// ==================

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return;

  // fluxo: tenta logar na API; se falhar, cai no modo offline local
  loginViaApi(email, password).catch(() => {
    // modo local simples (fallback)
    state.user = email;
    state.token = null;
    saveToStorage();
    showToast("Entrou em modo offline (sem backend).", "error");
    if (authSection) authSection.classList.add("hidden");
    if (dashboard) dashboard.classList.remove("hidden");
    if (currentUserLabel) {
      currentUserLabel.textContent = `Logado como: ${state.user}`;
    }
    initData();
  });
}

function switchAuthMode(mode) {
  authTabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle("active", isActive);
  });

  authPanes.forEach((pane) => {
    const isLogin = pane.id === "loginForm";
    pane.classList.toggle("hidden", mode === "login" ? !isLogin : isLogin);
  });
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const passwordConfirm = document
    .getElementById("regPasswordConfirm")
    .value.trim();

  if (!email || !password || !passwordConfirm) return;
  if (password !== passwordConfirm) {
    showToast("As senhas não conferem.", "error");
    return;
  }

  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    showToast("Conta criada com sucesso. Fazendo login...", "success");
    // limpa e já faz login automático
    registerForm.reset();
    await loginViaApi(email, password);
  } catch (err) {
    showToast(
      "Não foi possível cadastrar. Verifique se o email já não está em uso ou se o backend está online.",
      "error"
    );
  }
}

async function loginViaApi(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const res = await fetch(`${BASE_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    if (res.status === 400) {
      showToast("Email ou senha incorretos.", "error");
    } else {
      throw new Error("Falha ao logar na API");
    }
    throw new Error("login_failed");
  }

  const data = await res.json();
  state.token = data.access_token;
  state.user = email;
  saveToStorage();

  if (authSection) authSection.classList.add("hidden");
  if (dashboard) dashboard.classList.remove("hidden");

  if (currentUserLabel) {
    currentUserLabel.textContent = `Logado como: ${state.user}`;
  }

  showToast("Login realizado com sucesso.", "success");

  await initData();
}

function handleLogout() {
  state.user = null;
  state.token = null;
  saveToStorage();

  if (dashboard) dashboard.classList.add("hidden");
  if (authSection) authSection.classList.remove("hidden");
}

// ==================
// Palpites
// ==================

function handleBetSubmit(e) {
  e.preventDefault();

  const matchId = Number(matchSelect.value);
  const goalsA = Number(scoreA.value);
  const goalsB = Number(scoreB.value);

  if (!matchId || isNaN(goalsA) || isNaN(goalsB)) return;

  const match = state.matches.find((m) => m.id === matchId);
  if (!match) return;

  // tenta enviar para o backend; se falhar, salva localmente
  submitBet(matchId, goalsA, goalsB, match).catch(() => {
    const bet = {
      id: Date.now(),
      user: state.user,
      matchId,
      palpite: `${match.teamA} ${goalsA} - ${goalsB} ${match.teamB}`,
      createdAt: Date.now(),
    };
    state.bets.push(bet);
    saveToStorage();
    renderBets();
    renderStats();
    showToast(`Palpite salvo localmente: ${bet.palpite}`, "success");
  });

  betForm.reset();
  matchSelect.selectedIndex = 0;
}

// ==================
// Inicialização de dados
// ==================

async function initData() {
  await fetchMatchesFromApi();

  // ranking e palpites reais (se backend responder)
  try {
    const rankingData = await apiFetch("/ranking");
    state.ranking = rankingData || [];
  } catch {
    state.ranking = [];
  }

  try {
    if (state.token) {
      const betsData = await apiFetch("/bets/me");
      state.bets = (betsData || []).map((b) => ({
        id: b.id,
        user: state.user,
        matchId: b.match_id,
        palpite: `${b.match.team_a} ${b.goals_a} - ${b.goals_b} ${b.match.team_b}`,
        createdAt: new Date(b.created_at).getTime(),
      }));
    }
  } catch {
    // mantém bets locais
  }

  renderCompetitionsFilter();
  renderMatches();
  renderMatchSelect();
  renderRanking();
  renderBets();
  renderStats();
}

// ==================
// Eventos iniciais
// ==================

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  initHeroCarousel();
  renderNews();
  loadFromStorage();
  loadThemeFromStorage();

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (betForm) {
    betForm.addEventListener("submit", handleBetSubmit);
  }

  if (competitionFilter) {
    competitionFilter.addEventListener("change", () => {
      renderMatches();
      renderMatchSelect();
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  if (authTabs && authTabs.length) {
    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const mode = tab.dataset.mode || "login";
        switchAuthMode(mode);
      });
    });
  }

  // Se já existir usuário salvo, pula direto para o dashboard
  if (state.user) {
    if (authSection) authSection.classList.add("hidden");
    if (dashboard) dashboard.classList.remove("hidden");
    if (currentUserLabel) {
      currentUserLabel.textContent = `Logado como: ${state.user}`;
    }
    initData();
  }
});

async function submitBet(matchId, goalsA, goalsB, match) {
  if (!state.token) {
    throw new Error("no_token");
  }

  const body = {
    match_id: matchId,
    goals_a: goalsA,
    goals_b: goalsB,
  };

  const bet = await apiFetch("/bets", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const palpite = `${match.teamA} ${goalsA} - ${goalsB} ${match.teamB}`;

  const localBet = {
    id: bet.id,
    user: state.user,
    matchId,
    palpite,
    createdAt: new Date(bet.created_at).getTime(),
  };

  const idx = state.bets.findIndex((b) => b.matchId === matchId && b.user === state.user);
  if (idx >= 0) {
    state.bets[idx] = localBet;
  } else {
    state.bets.push(localBet);
  }

  saveToStorage();
  renderBets();
  renderStats();
  showToast(`Palpite registrado: ${palpite}`, "success");
}
