import { getCurrentWeather } from "./weatherAPI.js";

const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000;
const REQUEST_TIMEOUT = 12 * 1000;

function createTextElement(tagName, text, className = "") {
  const element = document.createElement(tagName);
  element.textContent = text;

  if (className !== "") {
    element.className = className;
  }

  return element;
}

function appendWeatherData(list, term, description) {
  const termElement = createTextElement("dt", term);
  const descriptionElement = createTextElement("dd", description);
  list.append(termElement, descriptionElement);
}

function getWeatherPresentation(code, isDay) {
  if (code === 0) {
    return { label: "맑음", symbol: isDay === 1 ? "☀" : "☾", tone: "clear" };
  }

  if ([1, 2].includes(code)) {
    return { label: "대체로 맑음", symbol: isDay === 1 ? "◐" : "☾", tone: "partly-cloudy" };
  }

  if (code === 3) {
    return { label: "흐림", symbol: "☁", tone: "cloudy" };
  }

  if ([45, 48].includes(code)) {
    return { label: "안개", symbol: "≋", tone: "fog" };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: "이슬비", symbol: "☂", tone: "rain" };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "비", symbol: "☂", tone: "rain" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "눈", symbol: "❄", tone: "snow" };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: "뇌우", symbol: "ϟ", tone: "storm" };
  }

  return { label: "날씨 정보 확인", symbol: "◎", tone: "unknown" };
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function initializeWeather() {
  const citySelect = document.getElementById("city-select");
  const weatherBox = document.getElementById("weather-box");
  const locationButton = document.getElementById("weather-location");
  const refreshButton = document.getElementById("weather-refresh");

  if (!(citySelect instanceof HTMLSelectElement)
    || weatherBox === null
    || !(locationButton instanceof HTMLButtonElement)
    || !(refreshButton instanceof HTMLButtonElement)) {
    return;
  }

  let activeController = null;
  let activeLocation = null;
  let autoRefreshTimer = 0;
  let lastSuccessfulRequest = 0;
  let latestRequestId = 0;

  function renderWeatherState(stateClass, ...content) {
    weatherBox.classList.remove("weather-loading", "weather-error", "weather-data", "weather-state-enter");
    weatherBox.setAttribute("aria-busy", stateClass === "weather-loading" ? "true" : "false");

    if (stateClass !== "") {
      weatherBox.classList.add(stateClass);
    }

    weatherBox.replaceChildren(...content);
    void weatherBox.offsetWidth;
    weatherBox.classList.add("weather-state-enter");
  }

  function updateControlState(isLoading = false) {
    refreshButton.disabled = isLoading || activeLocation === null;
    refreshButton.textContent = isLoading ? "날씨 불러오는 중" : "날씨 새로고침";
  }

  function clearAutoRefresh() {
    window.clearTimeout(autoRefreshTimer);
    autoRefreshTimer = 0;
  }

  function renderInitialMessage() {
    const message = createTextElement("p", "도시를 선택하거나 내 위치 사용 버튼을 누르면 현재 날씨를 확인할 수 있습니다.");
    renderWeatherState("", message);
  }

  function renderLoading(location) {
    const title = createTextElement("h4", `${location.name} 날씨 확인 중`);
    const message = document.createElement("p");
    const indicator = createTextElement("span", "•••", "weather-loading-indicator");
    indicator.setAttribute("aria-hidden", "true");
    message.append("최신 날씨 모델을 불러오는 중", indicator);
    renderWeatherState("weather-loading", title, message);
  }

  function renderWeather(location, weather) {
    const presentation = getWeatherPresentation(weather.weatherCode, weather.isDay);
    const current = document.createElement("div");
    const icon = createTextElement("span", presentation.symbol, "weather-symbol");
    const summary = document.createElement("div");
    const title = createTextElement("h4", `${location.name} 현재 날씨`);
    const condition = createTextElement("p", presentation.label, "weather-condition");
    const temperature = createTextElement("strong", `${weather.temperature}${weather.temperatureUnit}`, "weather-temperature");
    const weatherData = document.createElement("dl");
    const updateInfo = createTextElement(
      "p",
      `API 기준 ${weather.time.replace("T", " ")} · 화면 갱신 ${formatDateTime(new Date())}`,
      "weather-retrieved-at"
    );

    current.className = "weather-current";
    current.dataset.weatherTone = presentation.tone;
    icon.setAttribute("aria-hidden", "true");
    summary.append(title, condition);
    current.append(icon, summary, temperature);
    weatherData.className = "weather-data-list";
    appendWeatherData(weatherData, "체감온도", `${weather.apparentTemperature}${weather.apparentTemperatureUnit}`);
    appendWeatherData(weatherData, "상대습도", `${weather.humidity}${weather.humidityUnit}`);
    appendWeatherData(weatherData, "풍속", `${weather.windSpeed}${weather.windSpeedUnit}`);
    renderWeatherState("weather-data", current, weatherData, updateInfo);
  }

  function renderError(location, message) {
    const title = createTextElement("h4", `${location.name} 날씨를 불러오지 못했습니다`);
    const description = createTextElement("p", message);
    const retryButton = createTextElement("button", `${location.name} 날씨 다시 불러오기`, "weather-retry");
    retryButton.type = "button";
    retryButton.addEventListener("click", () => {
      loadWeather(location);
    });
    renderWeatherState("weather-error", title, description, retryButton);
  }

  function scheduleAutoRefresh() {
    clearAutoRefresh();

    if (activeLocation === null) {
      return;
    }

    autoRefreshTimer = window.setTimeout(() => {
      if (document.visibilityState === "visible" && activeLocation !== null) {
        loadWeather(activeLocation);
      } else {
        scheduleAutoRefresh();
      }
    }, AUTO_REFRESH_INTERVAL);
  }

  async function loadWeather(location) {
    latestRequestId += 1;
    const requestId = latestRequestId;

    clearAutoRefresh();

    if (activeController !== null) {
      activeController.abort();
    }

    const controller = new AbortController();
    let requestTimedOut = false;
    const requestTimeout = window.setTimeout(() => {
      requestTimedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT);
    activeController = controller;
    activeLocation = location;
    renderLoading(location);
    updateControlState(true);

    try {
      const weather = await getCurrentWeather(location.latitude, location.longitude, controller.signal);

      if (requestId !== latestRequestId || controller !== activeController) {
        return;
      }

      lastSuccessfulRequest = Date.now();
      renderWeather(location, weather);
      scheduleAutoRefresh();
    } catch (error) {
      if (requestId !== latestRequestId || controller !== activeController) {
        return;
      }

      if (error?.name === "AbortError") {
        if (requestTimedOut) {
          renderError(location, "날씨 서버의 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
        }
        return;
      }

      console.error("날씨 정보를 가져오는 중 오류가 발생했습니다.", error);
      renderError(location, "네트워크 상태를 확인한 뒤 다시 시도해 주세요.");
    } finally {
      window.clearTimeout(requestTimeout);

      if (requestId === latestRequestId && controller === activeController) {
        activeController = null;
        updateControlState();
      }
    }
  }

  function getSelectedCity() {
    const option = citySelect.options[citySelect.selectedIndex];

    if (option === undefined || option.value === "") {
      return null;
    }

    const latitude = Number(option.dataset.latitude);
    const longitude = Number(option.dataset.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      name: option.textContent.trim(),
      latitude,
      longitude
    };
  }

  function handleGeolocationError(error) {
    const messages = {
      1: "위치 권한이 거부되었습니다. 브라우저 설정을 확인하거나 도시를 선택해 주세요.",
      2: "현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      3: "위치 확인 시간이 초과되었습니다. 도시를 직접 선택해 주세요."
    };
    const message = messages[error.code] ?? "현재 위치를 확인하지 못했습니다.";
    const title = createTextElement("h4", "내 위치를 사용할 수 없습니다");
    const description = createTextElement("p", message);
    renderWeatherState("weather-error", title, description);
    updateControlState();
  }

  citySelect.addEventListener("change", () => {
    const city = getSelectedCity();

    if (city !== null) {
      loadWeather(city);
    }
  });

  refreshButton.addEventListener("click", () => {
    if (activeLocation !== null) {
      loadWeather(activeLocation);
    }
  });

  if (!("geolocation" in navigator)) {
    locationButton.disabled = true;
    locationButton.textContent = "위치 기능 미지원";
  } else {
    locationButton.addEventListener("click", () => {
      locationButton.disabled = true;
      locationButton.textContent = "위치 확인 중";

      navigator.geolocation.getCurrentPosition(
        (position) => {
          citySelect.selectedIndex = 0;
          locationButton.disabled = false;
          locationButton.textContent = "내 위치 사용";
          loadWeather({
            name: "현재 위치",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          locationButton.disabled = false;
          locationButton.textContent = "내 위치 사용";
          handleGeolocationError(error);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible"
      && activeLocation !== null
      && Date.now() - lastSuccessfulRequest >= AUTO_REFRESH_INTERVAL) {
      loadWeather(activeLocation);
    }
  });

  window.addEventListener("pagehide", () => {
    clearAutoRefresh();
    activeController?.abort();
  });

  renderInitialMessage();
  updateControlState();
}

initializeWeather();
