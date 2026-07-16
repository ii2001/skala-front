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
    current: "temperature_2m,relative_humidity_2m",
    timezone: "auto"
  });
  const requestOptions = signal === undefined ? {} : { signal };
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
  const temperatureUnit = currentUnits.temperature_2m;
  const humidityUnit = currentUnits.relative_humidity_2m;
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

  if (typeof temperatureUnit !== "string" || temperatureUnit.trim() === "") {
    throw new Error("응답의 온도 단위가 올바르지 않습니다.");
  }

  if (typeof humidityUnit !== "string" || humidityUnit.trim() === "") {
    throw new Error("응답의 습도 단위가 올바르지 않습니다.");
  }

  if (typeof time !== "string" || time.trim() === "") {
    throw new Error("응답의 관측 기준 시간이 올바르지 않습니다.");
  }

  return {
    temperature,
    humidity,
    temperatureUnit,
    humidityUnit,
    time
  };
}
