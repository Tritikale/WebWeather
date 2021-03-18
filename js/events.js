const cityForm = document.forms['form'];
const updateButton = document.getElementsByClassName('update-button')[0];
const favoriteCitiesList = document.getElementsByClassName('fav-list')[0];
const currentCity = document.getElementsByClassName('main-city')[0];
const myStorage = window.localStorage;


cityForm.addEventListener('submit', function(e) {
    const cityInput = document.getElementById('favorite-city-name');
    addFavoriteCityToUI(cityInput.value.trim());
    cityInput.value = '';
    e.preventDefault();
});

favoriteCitiesList.addEventListener('click', function(event) {
    if (!event.target.className.includes('remove-button')) {
        return;
    }

    const cityId = event.target.closest('li').id.split('_')[1];
    const cityName = event.target.closest('li').getElementsByClassName('city-info-name')[0].textContent;
    deleteFavoriteCityById(cityId);
    myStorage.removeItem(cityName);
});

updateButton.addEventListener('click', function() {
    setLoaderOnCurrentCity();
    loadCoordinatesFromGeolocationAPI();
});

document.addEventListener('DOMContentLoaded', function() {
    setLoaderOnCurrentCity();
    loadCoordinatesFromGeolocationAPI();
    loadCitiesFromLocalStorage();
});

function loadCoordinatesFromGeolocationAPI() {
    navigator.geolocation.getCurrentPosition(function(position) {
        updateCurrentCityInformation({
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
        });
    }, function(e) {
        updateCurrentCityInformation({
            'latitude': 59.8944,
            'longitude': 30.2642
        });
        console.warn(`No access to geolocation: ` + e.message)
    });
}

async function updateCurrentCityInformation(coordinates) {
    let weatherData = await getWeatherByCoordinates(coordinates['latitude'], coordinates['longitude'])

    currentCity.getElementsByClassName('city-info-name')[0].textContent = weatherData['name'];
    currentCity.getElementsByClassName('weather-icon')[0].src = getWeatherIcon(weatherData);
    currentCity.getElementsByClassName('city-info-temperature')[0].innerHTML = `${Math.round(weatherData['main']['temp_min'])}°C`;

    const infoWeatherElement = currentCity.getElementsByClassName('weather-info')[0];
    infoWeatherElement.getElementsByClassName('wind')[0].getElementsByClassName('weather-info-value')[0].textContent = `${weatherData['wind']['speed']} m/s, ${weatherData['wind']['deg']} deg`;
    infoWeatherElement.getElementsByClassName('cloudiness')[0].getElementsByClassName('weather-info-value')[0].textContent = weatherData['weather'][0]['main'];
    infoWeatherElement.getElementsByClassName('pressure')[0].getElementsByClassName('weather-info-value')[0].textContent = `${weatherData['main']['pressure']} hpa`;
    infoWeatherElement.getElementsByClassName('humidity')[0].getElementsByClassName('weather-info-value')[0].textContent = `${weatherData['main']['humidity']}%`;
    infoWeatherElement.getElementsByClassName('coordinates')[0].getElementsByClassName('weather-info-value')[0].textContent = `[${weatherData['coord']['lat']}, ${weatherData['coord']['lon']}]`;

    unsetLoaderOnCurrentCity();
}

async function loadCitiesFromLocalStorage() {
    const copiedStorage = {};
    for (let key of Object.keys(myStorage)) {
        copiedStorage[key] = myStorage.getItem(key);
    }
    myStorage.clear();

    for (let key in copiedStorage) {
        await addFavoriteCityToUI(key);
    }
}

async function addFavoriteCityToUI(cityName) {
    var cityId = cityName;

    const template = document.getElementById('fav-city-template');
    const favoriteCityElement = document.importNode(template.content.firstElementChild, true);
    favoriteCityElement.id = `favorite_${cityId}`;

    favoriteCitiesList.appendChild(favoriteCityElement);

    let weatherData = await getWeatherByCityName(cityName);

    if (weatherData == undefined) {
        alert('No internet connection.');
        deleteFavoriteCityById(cityId);
        return null;
    }

    if (weatherData['cod'] !== 200) {
        alert('City name is incorrect or information is missing.');
        deleteFavoriteCityById(cityId);
        return null;
    }

    if (myStorage.getItem(weatherData['name']) !== null) {
        alert('You already have this city in favorites');
        deleteFavoriteCityById(cityId);
        return null;
    }

    myStorage.setItem(weatherData['name'], cityId);

    const favCityInfoElement = favoriteCityElement.getElementsByClassName('city-info')[0];
    favCityInfoElement.getElementsByClassName('city-info-name')[0].textContent = weatherData['name'];
    favCityInfoElement.getElementsByClassName('city-info-temperature')[0].innerHTML = `${Math.round(weatherData['main']['temp_min'])}°C`;
    favCityInfoElement.getElementsByClassName('weather-icon')[0].src = getWeatherIcon(weatherData);

    const infoWeatherElement = favoriteCityElement.getElementsByClassName('weather-info')[0];
    infoWeatherElement.getElementsByClassName('wind')[0].getElementsByClassName('weather-info-value')[0].textContent = `${weatherData['wind']['speed']} m/s, ${weatherData['wind']['deg']} deg`;
    infoWeatherElement.getElementsByClassName('cloudiness')[0].getElementsByClassName('weather-info-value')[0].textContent = weatherData['weather'][0]['main'];
    infoWeatherElement.getElementsByClassName('pressure')[0].getElementsByClassName('weather-info-value')[0].textContent = `${weatherData['main']['pressure']} hpa`;
    infoWeatherElement.getElementsByClassName('humidity')[0].getElementsByClassName('weather-info-value')[0].textContent = `${weatherData['main']['humidity']}%`;
    infoWeatherElement.getElementsByClassName('coordinates')[0].getElementsByClassName('weather-info-value')[0].textContent = `[${weatherData['coord']['lat']}, ${weatherData['coord']['lon']}]`;

    unsetLoaderOnFavoriteCity(cityId);
}

function deleteFavoriteCityById(cityId) {
    const cityObject = document.getElementById(`favorite_${cityId}`);
    cityObject.remove();
}

function setLoaderOnCurrentCity() {
    if (!currentCity.classList.contains('loader-on')) {
        currentCity.classList.add('loader-on');
    }
}

function unsetLoaderOnCurrentCity() {
    currentCity.classList.remove('loader-on');
}

function unsetLoaderOnFavoriteCity(cityId) {
    const cityObject = document.getElementById(`favorite_${cityId}`);
    cityObject.classList.remove('loader-on');
}