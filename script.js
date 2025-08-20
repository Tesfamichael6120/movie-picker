const movieListTextarea = document.getElementById("movieList");
const categorySelect = document.getElementById("categorySelect");
const pickButton = document.getElementById("pickButton");
const roulette = document.getElementById("roulette");
const resultDiv = document.getElementById("result");
const countdownDiv = document.getElementById("countdown");
const historyList = document.getElementById("historyList");
const rollSound = document.getElementById("rollSound");
const dingSound = document.getElementById("dingSound");

// Load saved movies per category
let movieData = JSON.parse(localStorage.getItem("movieData")) || {
    default: [],
    action: [],
    comedy: [],
    horror: []
};

function saveData() {
    localStorage.setItem("movieData", JSON.stringify(movieData));
}

// Load initial movies into textarea
function loadCategory() {
    const category = categorySelect.value;
    movieListTextarea.value = movieData[category].join("\n");
}
loadCategory();

// Update textarea on category change
categorySelect.addEventListener("change", () => {
    loadCategory();
});

// Save movies on input
movieListTextarea.addEventListener("input", () => {
    const category = categorySelect.value;
    movieData[category] = movieListTextarea.value.split("\n").filter(m => m.trim() !== "");
    saveData();
});

// History (last 5 picks)
let history = JSON.parse(localStorage.getItem("history")) || [];
function updateHistory(newPick) {
    history.unshift(newPick);
    if (history.length > 5) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    historyList.innerHTML = history.map(m => `<li>${m}</li>`).join("");
}
updateHistory("");

// Pick movie function
pickButton.addEventListener("click", () => {
    const category = categorySelect.value;
    const movies = movieData[category];
    if (movies.length === 0) return alert("Please enter at least one movie!");

    // Countdown
    let count = 3;
    countdownDiv.textContent = count;
    roulette.classList.remove("hidden");
    resultDiv.textContent = "";

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) countdownDiv.textContent = count;
        else {
            clearInterval(countdownInterval);
            countdownDiv.textContent = "";
            startRoulette(movies, category);
        }
    }, 1000);
});

// Roulette animation
function startRoulette(movies, category) {
    rollSound.currentTime = 0;
    rollSound.play();
    let spins = 30 + Math.floor(Math.random() * 20);
    let count = 0;
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * movies.length);
        roulette.textContent = movies[randomIndex];
        count++;
        if (count >= spins) {
            clearInterval(interval);
            const finalIndex = Math.floor(Math.random() * movies.length);
            const finalMovie = movies[finalIndex];
            roulette.classList.add("hidden");
            resultDiv.textContent = finalMovie;

            // Pop animation
            resultDiv.style.transform = "scale(1.5)";
            resultDiv.style.transition = "transform 0.3s";
            setTimeout(() => resultDiv.style.transform = "scale(1)", 300);

            // Ding sound
            dingSound.currentTime = 0;
            dingSound.play();

            // Confetti colors by category
            let color = "#FFD700";
            if (category === "action") color = "#FF0000";
            if (category === "comedy") color = "#FFFF00";
            if (category === "horror") color = "#800080";
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [color] });

            updateHistory(finalMovie);
        }
    }, 50);
}
