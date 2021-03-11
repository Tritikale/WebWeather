const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY = 'd12f7b22ca4d27fa61a518b5686b8cfc';

function getWeatherByCityName(cityName) {
    const url = `${API_URL}?q=${cityName}&units=metric&appid=${API_KEY}`;
    return doRequest(url);
}

function getWeatherByCoordinates(lat, lon) {
    const url = `${API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    return doRequest(url);
}

function getWeatherIcon(iconName) {
    return `https://openweathermap.org/img/wn/${iconName}.png`
}

function doRequest(url) {
    return fetch(url).then(response => {
        return response.json();
    }).catch(e => {
        console.warn(`There is a problem with your fetch operation for "${url}": ` + e.message)
    });
}