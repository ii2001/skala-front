const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

function validateCoordinate(value, name, minimum, maximum) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${name}는 유효한 숫자여야 합니다.`);
  }

  if (value < minimum || value > maximum) {
    throw new Error(`${name}는 ${minimum}부터 ${maximum} 사이여야 합니다.`);
  }
}

export async function getCurrentWeather(latitude, longitude, signal) {
  validateCoordinate(latitude, "위도", -90, 90);
  validateCoordinate(longitude, "경도", -180, 180);

  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    timezone: "auto"
  });
  const requestOptions = {
    cache: "no-store",
    ...(signal === undefined ? {} : { signal })
  };
  const response = await fetch(`${OPEN_METEO_URL}?${query.toString()}`, requestOptions);

  if (!response.ok) {
    throw new Error(`날씨 요청에 실패했습니다. (HTTP ${response.status})`);
  }

  const data = await response.json();
  const current = data?.current;
  const currentUnits = data?.current_units;

  if (current === null || typeof current !== "object" || Array.isArray(current)) {
    throw new Error("응답에 현재 날씨 데이터가 없습니다.");
  }

  if (currentUnits === null || typeof currentUnits !== "object" || Array.isArray(currentUnits)) {
    throw new Error("응답에 날씨 단위 정보가 없습니다.");
  }

  const temperature = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const apparentTemperature = current.apparent_temperature;
  const weatherCode = current.weather_code;
  const windSpeed = current.wind_speed_10m;
  const isDay = current.is_day;
  const temperatureUnit = currentUnits.temperature_2m;
  const humidityUnit = currentUnits.relative_humidity_2m;
  const apparentTemperatureUnit = currentUnits.apparent_temperature;
  const windSpeedUnit = currentUnits.wind_speed_10m;
  const time = current.time;

  if (typeof temperature !== "number" || !Number.isFinite(temperature)) {
    throw new Error("응답의 현재 온도 값이 올바르지 않습니다.");
  }

  if (typeof humidity !== "number"
    || !Number.isFinite(humidity)
    || humidity < 0
    || humidity > 100) {
    throw new Error("응답의 상대습도 값은 0부터 100 사이여야 합니다.");
  }

  if (typeof apparentTemperature !== "number" || !Number.isFinite(apparentTemperature)) {
    throw new Error("응답의 체감온도 값이 올바르지 않습니다.");
  }

  if (typeof weatherCode !== "number" || !Number.isInteger(weatherCode)) {
    throw new Error("응답의 날씨 코드가 올바르지 않습니다.");
  }

  if (typeof windSpeed !== "number" || !Number.isFinite(windSpeed) || windSpeed < 0) {
    throw new Error("응답의 풍속 값이 올바르지 않습니다.");
  }

  if (isDay !== 0 && isDay !== 1) {
    throw new Error("응답의 주야간 정보가 올바르지 않습니다.");
  }

  if (typeof temperatureUnit !== "string" || temperatureUnit.trim() === "") {
    throw new Error("응답의 온도 단위가 올바르지 않습니다.");
  }

  if (typeof humidityUnit !== "string" || humidityUnit.trim() === "") {
    throw new Error("응답의 습도 단위가 올바르지 않습니다.");
  }

  if (typeof apparentTemperatureUnit !== "string" || apparentTemperatureUnit.trim() === "") {
    throw new Error("응답의 체감온도 단위가 올바르지 않습니다.");
  }

  if (typeof windSpeedUnit !== "string" || windSpeedUnit.trim() === "") {
    throw new Error("응답의 풍속 단위가 올바르지 않습니다.");
  }

  if (typeof time !== "string" || time.trim() === "") {
    throw new Error("응답의 관측 기준 시간이 올바르지 않습니다.");
  }

  return {
    temperature,
    humidity,
    apparentTemperature,
    weatherCode,
    windSpeed,
    isDay,
    temperatureUnit,
    humidityUnit,
    apparentTemperatureUnit,
    windSpeedUnit,
    time
  };
}
