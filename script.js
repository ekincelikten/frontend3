
const socket = io("https://backend3-3064.onrender.com");

const loginScreen = document.getElementById("login-screen");
const lobbyScreen = document.getElementById("lobby-screen");
const gameScreen = document.getElementById("game-screen");
const lobbyOptions = document.getElementById("lobby-options");

const nicknameInput = document.getElementById("nickname");
const lobbyNameInput = document.getElementById("lobby-name");
const joinLobbyIdInput = document.getElementById("join-lobby-id");

const createLobbyBtn = document.getElementById("create-lobby");
const joinLobbyBtn = document.getElementById("join-lobby");
const startGameBtn = document.getElementById("start-game");

const lobbyTitle = document.getElementById("lobby-title");
const playerList = document.getElementById("player-list");
const roleDisplay = document.getElementById("your-role");
const gamePlayers = document.getElementById("game-players");

let currentLobbyId = null;
let isOwner = false;

createLobbyBtn.onclick = () => {
  const nickname = nicknameInput.value.trim();
  const lobbyName = lobbyNameInput.value.trim() || "Hortlaklı Lobi";
  if (!nickname) return alert("Takma ad gerekli");

  socket.emit("createLobby", { nickname, lobbyName }, ({ lobbyId, avatar }) => {
    currentLobbyId = lobbyId;
    isOwner = true;
    showLobby(lobbyName);
  });
};

joinLobbyBtn.onclick = () => {
  const nickname = nicknameInput.value.trim();
  const lobbyId = joinLobbyIdInput.value.trim();
  if (!nickname || !lobbyId) return alert("Takma ad ve Lobi ID gerekli");

  socket.emit("joinLobby", { lobbyId, nickname }, ({ avatar }) => {
    currentLobbyId = lobbyId;
    isOwner = false;
    showLobby("Lobi: " + lobbyId);
  });
};

startGameBtn.onclick = () => {
  if (currentLobbyId) {
    socket.emit("startGame", currentLobbyId);
  }
};

socket.on("lobbyUpdated", (lobby) => {
  lobbyTitle.textContent = lobby.name;
  playerList.innerHTML = "";
  lobby.players.forEach(p => {
    const div = document.createElement("div");
    const img = document.createElement("img");
    img.src = `/avatars/${p.avatar}`;
    img.alt = p.nickname;
    img.width = 80;
    img.style.borderRadius = "10px";
    div.appendChild(img);
    const name = document.createElement("p");
    name.textContent = p.nickname;
    div.appendChild(name);
    playerList.appendChild(div);
  });
  if (isOwner && lobby.players.length >= 5) {
    startGameBtn.style.display = "inline-block";
  } else {
    startGameBtn.style.display = "none";
  }
});

socket.on("gameStarted", (lobby) => {
  const me = lobby.players.find(p => p.id === socket.id);
  roleDisplay.textContent = `Rolün: ${me.role}`;

  gamePlayers.innerHTML = "";
  lobby.players.forEach(p => {
    const div = document.createElement("div");
    const img = document.createElement("img");
    img.src = `/avatars/${p.avatar}`;
    img.alt = p.nickname;
    img.width = 80;
    img.style.borderRadius = "10px";
    div.appendChild(img);
    const name = document.createElement("p");
    name.textContent = p.nickname + (p.id === socket.id ? " (sen)" : "");
    div.appendChild(name);
    gamePlayers.appendChild(div);
  });

  lobbyScreen.style.display = "none";
  gameScreen.style.display = "block";
});

function showLobby(title) {
  lobbyOptions.style.display = "none";
  lobbyScreen.style.display = "block";
  lobbyTitle.textContent = title;
}



const confirmBtn = document.getElementById("confirm-nickname");

confirmBtn.onclick = () => {
  if (!nicknameInput.value.trim()) {
    alert("Takma ad gerekli");
    return;
  }
  loginScreen.style.display = "none";
  lobbyOptions.style.display = "block";
};
