(() => {
  "use strict";

  const storageKey = "skala-portfolio-theme";
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function readStoredTheme() {
    try {
      const storedTheme = window.localStorage.getItem(storageKey);

      return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
    } catch {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // 저장소를 사용할 수 없어도 현재 페이지의 테마 전환은 유지합니다.
    }
  }

  function getSystemTheme() {
    return systemTheme.matches ? "dark" : "light";
  }

  let selectedTheme = readStoredTheme();

  function updateToggle(button) {
    const isDark = root.dataset.theme === "dark";

    button.setAttribute("aria-pressed", String(isDark));
    button.hidden = false;
  }

  function applyTheme(theme, button) {
    root.dataset.theme = theme;

    if (button) {
      updateToggle(button);
    }
  }

  applyTheme(selectedTheme ?? getSystemTheme());

  function initializeThemeToggle() {
    const toggleButton = document.querySelector(".theme-toggle");

    if (!toggleButton) {
      return;
    }

    updateToggle(toggleButton);

    toggleButton.addEventListener("click", () => {
      selectedTheme = root.dataset.theme === "dark" ? "light" : "dark";
      storeTheme(selectedTheme);
      applyTheme(selectedTheme, toggleButton);
    });

    const handleSystemThemeChange = (event) => {
      if (selectedTheme === null) {
        applyTheme(event.matches ? "dark" : "light", toggleButton);
      }
    };

    if (typeof systemTheme.addEventListener === "function") {
      systemTheme.addEventListener("change", handleSystemThemeChange);
    } else {
      systemTheme.addListener(handleSystemThemeChange);
    }

    window.addEventListener("storage", (event) => {
      if (event.key !== storageKey) {
        return;
      }

      selectedTheme = event.newValue === "light" || event.newValue === "dark" ? event.newValue : null;
      applyTheme(selectedTheme ?? getSystemTheme(), toggleButton);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeThemeToggle, { once: true });
  } else {
    initializeThemeToggle();
  }
})();
