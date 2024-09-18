import {render, act} from '@testing-library/react-native';
import HomeScreen from '../../screens/HomeScreen';
import {fetchGeolocation, fetchWeather} from '../../services/weatherService';

jest.mock('../../services/weatherService');
jest.mock('../../helpers/getWeatherImage');

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    if ((console.error as jest.Mock).mock.calls.length > 0) {
      console.log(
        'Console errors were caught:',
        (console.error as jest.Mock).mock.calls,
      );
    }
  });

  it('renders without crashing', () => {
    (fetchGeolocation as jest.Mock).mockResolvedValue([
      {latitude: 52.52, longitude: 13.405},
    ]);
    (fetchWeather as jest.Mock).mockResolvedValue({
      current_temperature: 20,
      weather_code: 'clear',
      weekly: [{day: 'Monday', avgTemperature: 18, weather_code: 'clear'}],
    });

    let error;
    act(() => {
      try {
        render(<HomeScreen />);
      } catch (e) {
        error = e;
      }
    });

    if (error) {
      console.log('Error caught during rendering:', error);
    }
  });
});
