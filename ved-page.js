const THEME_KEY = "ved.art.v4.theme";

const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const yearNode = document.getElementById("year");

const applyTheme = (theme) => {
  const nextTheme = theme === "night" ? "night" : "day";
  body.dataset.theme = nextTheme;
  themeToggle.textContent = nextTheme === "night" ? "Switch to Day" : "Switch to Night";
  localStorage.setItem(THEME_KEY, nextTheme);
};

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme === "night" ? "night" : "day");

themeToggle.addEventListener("click", () => {
  const currentTheme = body.dataset.theme === "night" ? "night" : "day";
  applyTheme(currentTheme === "night" ? "day" : "night");
});

yearNode.textContent = new Date().getFullYear();
