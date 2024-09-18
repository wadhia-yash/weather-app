import axios from 'axios';

export const fetchGeolocation = async (location: string) => {
  const response = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
  );
  return response.data.results || [];
};

export const fetchWeather = async (latitude: number, longitude: number) => {
  const response = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weather_code`,
  );
  const data = response.data;
  return {
    current_temperature: data.current_weather.temperature,
    weather_code: data.current_weather.weather_code,
    weekly: data.daily.time.map((day: string, index: number) => ({
      day,
      avgTemperature: Math.round(
        (data.daily.temperature_2m_max[index] +
          data.daily.temperature_2m_min[index]) /
          2,
      ),
      weather_code: data.daily.weather_code[index],
    })),
  };
};
