import {fetchWeather} from '../../services/weatherService';

test('fetches weather data correctly', async () => {
  const data = await fetchWeather(19.08869, 72.86792);
  expect(data.current_temperature).toBeDefined();
});
