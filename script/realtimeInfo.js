import { getCurrentWeather } from "./weatherAPI.js";

function createTextElement(tagName, text) {
  const element = document.createElement(tagName);
  element.textContent = text;
  return element;
}

function appendWeatherData(list, term, description) {
  const termElement = createTextElement("dt", term);
  const descriptionElement = createTextElement("dd", description);
  list.append(termElement, descriptionElement);
}

function initializeWeather() {
  const citySelect = document.getElementById("city-select");
  const weatherBox = document.getElementById("weather-box");

  if (citySelect === null || weatherBox === null) {
    return;
  }

  let activeController = null;
  let latestRequestId = 0;

  function renderWeatherState(stateClass, ...content) {
    weatherBox.classList.remove("weather-loading", "weather-error", "weather-data");
    weatherBox.setAttribute("aria-busy", stateClass === "weather-loading" ? "true" : "false");

    if (stateClass !== "") {
      weatherBox.classList.add(stateClass);
    }

    weatherBox.replaceChildren(...content);
  }

  function renderInitialMessage() {
    const message = createTextElement("p", "도시를 선택하면 현재 날씨를 확인할 수 있습니다.");
    renderWeatherState("", message);
  }

  function renderLoading(cityName, latitude, longitude) {
    const title = createTextElement("h4", `${cityName} 날씨 확인 중`);
    const location = createTextElement("p", `위도: ${latitude}, 경도: ${longitude}`);
    const message = createTextElement("p", "로딩 중… ⏳");
    renderWeatherState("weather-loading", title, location, message);
  }

  function renderWeather(cityName, weather) {
    const title = createTextElement("h4", `${cityName} 현재 날씨`);
    const weatherData = document.createElement("dl");
    weatherData.className = "weather-data-list";

    appendWeatherData(weatherData, "현재 온도", `${weather.temperature}${weather.temperatureUnit}`);
    appendWeatherData(weatherData, "상대습도", `${weather.humidity}${weather.humidityUnit}`);
    appendWeatherData(weatherData, "관측 기준 시간", weather.time.replace("T", " "));
    renderWeatherState("weather-data", title, weatherData);
  }

  function renderError(cityName) {
    const title = createTextElement("h4", `${cityName} 날씨를 불러오지 못했습니다`);
    const message = createTextElement("p", "잠시 후 다시 시도하거나 다른 도시를 선택해 주세요.");
    renderWeatherState("weather-error", title, message);
  }

  citySelect.addEventListener("change", async () => {
    latestRequestId += 1;
    const requestId = latestRequestId;

    if (activeController !== null) {
      activeController.abort();
      activeController = null;
    }

    const selectedOption = citySelect.options[citySelect.selectedIndex];

    if (selectedOption === undefined || selectedOption.value === "") {
      renderInitialMessage();
      return;
    }

    const cityName = selectedOption.textContent.trim();
    const latitudeText = selectedOption.dataset.latitude;
    const longitudeText = selectedOption.dataset.longitude;
    const latitude = latitudeText === undefined || latitudeText.trim() === ""
      ? Number.NaN
      : Number(latitudeText);
    const longitude = longitudeText === undefined || longitudeText.trim() === ""
      ? Number.NaN
      : Number(longitudeText);
    const controller = new AbortController();
    activeController = controller;
    renderLoading(cityName, latitude, longitude);

    try {
      const weather = await getCurrentWeather(latitude, longitude, controller.signal);

      if (requestId !== latestRequestId || controller !== activeController) {
        return;
      }

      renderWeather(cityName, weather);
    } catch (error) {
      if (error?.name === "AbortError" || requestId !== latestRequestId || controller !== activeController) {
        return;
      }

      console.error("날씨 정보를 가져오는 중 오류가 발생했습니다.", error);
      renderError(cityName);
    } finally {
      if (requestId === latestRequestId && controller === activeController) {
        activeController = null;
      }
    }
  });

  renderInitialMessage();
}

initializeWeather();
