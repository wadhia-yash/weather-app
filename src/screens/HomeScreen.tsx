import {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {debounce} from 'lodash';
import {fetchGeolocation, fetchWeather} from '../services/weatherService';
import getWeatherImage, {WeatherCode} from '../helpers/getWeatherImage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type WeatherData = {
  current_temperature: number;
  weather_code: string;
  weekly: {
    day: string;
    avgTemperature: number;
    weather_code: string;
  }[];
};

type GeolocationResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id: number;
  timezone: string;
  population?: number;
  country_id: number;
  country: string;
  admin1: string;
  admin2_id?: number;
  admin2?: string;
};

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState<string>('Berlin');
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [search, setSearch] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<GeolocationResult>>([]);

  useEffect(() => {
    getWeatherData(location);
  }, [location]);

  // Fetch weather data based on the selected location
  const getWeatherData = async (loc: string) => {
    const geoData = await fetchGeolocation(loc);
    if (geoData.length > 0) {
      const {latitude, longitude} = geoData[0];
      try {
        const weather = await fetchWeather(latitude, longitude);
        setWeatherData(weather);
      } catch (err) {
        setError('Error while fetching weather data');
      }
    }
  };

  // Fetch location suggestions based on user input (debounced)
  const fetchLocationSuggestions = async (query: string) => {
    if (query.length > 2) {
      // Fetch suggestions if input length is > 2
      const geoData = await fetchGeolocation(query);
      setSuggestions(geoData);
    } else {
      setSuggestions([]);
    }
  };

  // Debounced search handler
  const debouncedFetchSuggestions = debounce((query: string) => {
    fetchLocationSuggestions(query);
  }, 500);

  const handleSearchInput = (text: string) => {
    setSearch(text);
    debouncedFetchSuggestions(text);
  };

  // When user selects a location from the suggestions list
  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setSearch('');
    setSuggestions([]);
  };

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}>
        <Text style={styles.text}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}>
      <Text style={styles.title}>Weather in {location}</Text>
      <TextInput
        placeholder="Search location"
        value={search}
        onChangeText={handleSearchInput}
        style={styles.input}
        placeholderTextColor={'#fff'}
      />

      {/* Display location suggestions */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleLocationSelect(item.name)}
              style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>
                {item.name}, {item.admin1}, {item.country}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}

      {/* Display weather data */}
      {weatherData ? (
        <View>
          <Text style={styles.text}>
            Current Temperature: {Math.round(weatherData.current_temperature)}°C
          </Text>
          <Image
            source={{
              uri: getWeatherImage(weatherData.weather_code as WeatherCode),
            }}
            style={styles.image}
          />
          <Text style={styles.text}>Weekly Forecast:</Text>
          <FlatList
            data={weatherData.weekly}
            renderItem={({item}) => (
              <View style={styles.forecastItem}>
                <Text style={styles.text}>
                  {item.day}: {item.avgTemperature}°C
                </Text>
                <Image
                  source={{
                    uri: getWeatherImage(item.weather_code as WeatherCode),
                  }}
                  style={styles.image}
                />
              </View>
            )}
            keyExtractor={item => item.day}
          />
        </View>
      ) : (
        <Text style={styles.text}>Loading...</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#070F2B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: '#fff',
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  suggestionText: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#070F2B',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
  image: {
    width: 50,
    height: 50,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export default HomeScreen;
