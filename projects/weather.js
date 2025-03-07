// DOM elements
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');
const weatherCards = document.querySelector('.weather-cards');
const forecastContainer = document.querySelector('.forecast');

// API configuration
const API_KEY = 'd4b16945eb80fa97c036d9efd06adab6'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    // Load default cities on page load
    getWeatherData('New York');
    getWeatherData('Los Angeles');
    getWeatherData('London');

    // Set up search functionality
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            getWeatherData(searchTerm, true);
            searchInput.value = '';
        }
    });
});

// Fetch current weather data
async function getWeatherData(city, updateForecast = false) {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`City not found or API error: ${response.statusText}`);
        }
        const data = await response.json();

        // Update UI with current weather
        updateWeatherCard(data);

        // If this is a user search, also update the forecast
        if (updateForecast) {
            getForecastData(city);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(`Couldn't get weather for ${city}. Please try another location.`);
    }
}

// Fetch 7-day forecast data
async function getForecastData(city) {
    try {
        // First, get coordinates from city name (required for OneCall API)
        const geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            throw new Error('Location not found');
        }

        const { lat, lon } = geoData[0];

        // Now get forecast using coordinates
        const forecastResponse = await fetch(`${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastResponse.json();

        // Update forecast UI
        updateForecastUI(city, forecastData);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

// Update weather card with API data
function updateWeatherCard(data) {
    // Format date
    const date = new Date();
    const formattedDate = `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Get appropriate weather icon
    const weatherIcon = getWeatherIcon(data.weather[0].main);

    // Check if card for this city already exists
    const existingCard = Array.from(document.querySelectorAll('.card-location')).find(
        el => el.textContent === data.name
    );

    if (existingCard) {
        // Update existing card
        const card = existingCard.closest('.weather-card');
        card.querySelector('.card-date').textContent = formattedDate;
        card.querySelector('.temperature').textContent = `${Math.round(data.main.temp)}°`;
        card.querySelector('.weather-icon').textContent = weatherIcon;

        // Update details
        const details = card.querySelectorAll('.detail-value');
        details[0].textContent = `${Math.round(data.main.feels_like)}°`; // Feels like
        details[1].textContent = `${data.main.humidity}%`; // Humidity
        details[2].textContent = `${Math.round(data.wind.speed * 2.237)} mph`; // Wind (convert m/s to mph)

        // Set UV index (not directly available in this API endpoint)
        details[3].textContent = getUVIndexPlaceholder();
    } else {
        // Create new card
        const newCard = document.createElement('div');
        newCard.className = 'weather-card';
        newCard.innerHTML = `
            <div class="card-header">
                <div class="card-location">${data.name}</div>
                <div class="card-date">${formattedDate}</div>
            </div>
            <div class="card-main">
                <div class="temperature">${Math.round(data.main.temp)}°</div>
                <div class="weather-icon">${weatherIcon}</div>
            </div>
            <div class="card-details">
                <div class="detail-item">
                    <span class="detail-label">Feels Like</span>
                    <span class="detail-value">${Math.round(data.main.feels_like)}°</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${data.main.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">${Math.round(data.wind.speed * 2.237)} mph</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">UV Index</span>
                    <span class="detail-value">${getUVIndexPlaceholder()}</span>
                </div>
            </div>
        `;
        weatherCards.appendChild(newCard);
    }
}

// Update forecast UI
function updateForecastUI(city, data) {
    // Update forecast title
    const forecastTitle = forecastContainer.querySelector('.forecast-title');
    forecastTitle.textContent = `${city} - 7 Day Forecast`;

    // Get forecast days container
    const forecastDays = forecastContainer.querySelector('.forecast-days');
    forecastDays.innerHTML = ''; // Clear existing forecast

    // Add today and next 6 days
    const days = ['Today', 'Tomorrow'];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();

    data.daily.slice(0, 7).forEach((day, index) => {
        let dayName;
        if (index < 2) {
            dayName = days[index];
        } else {
            const dayIndex = (today + index) % 7;
            dayName = weekdays[dayIndex];
        }

        const dayEl = document.createElement('div');
        dayEl.className = 'forecast-day';
        dayEl.innerHTML = `
            <div class="day-name">${dayName}</div>
            <div class="day-icon">${getWeatherIcon(day.weather[0].main)}</div>
            <div class="day-temp">${Math.round(day.temp.day)}°</div>
        `;
        forecastDays.appendChild(dayEl);
    });
}

// Helper function to get weather icon based on condition
function getWeatherIcon(condition) {
    const conditionMap = {
        'Clear': '☀️',
        'Clouds': '🌤️',
        'Drizzle': '🌦️',
        'Rain': '🌧️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '🌫️',
        'Haze': '🌫️',
        'Dust': '🌫️',
        'Fog': '🌫️',
        'Sand': '🌫️',
        'Ash': '🌫️',
        'Squall': '💨',
        'Tornado': '🌪️'
    };

    return conditionMap[condition] || '🌤️';
}

// Helper function for UV index (placeholder since not in basic API)
function getUVIndexPlaceholder() {
    const values = [
        '1 (Low)',
        '2 (Low)',
        '3 (Moderate)',
        '4 (Moderate)',
        '5 (Moderate)',
        '6 (High)',
        '7 (High)',
        '8 (Very High)',
        '9 (Very High)'
    ];

    return values[Math.floor(Math.random() * values.length)];
}