const cityForm = document.forms['form'];
const updateButton = document.getElementsByClassName('update-button')[0];
const favoriteCitiesList = document.getElementsByClassName('fav-list')[0];
const currentCity = document.getElementsByClassName('main-city')[0];
const myStorage = window.localStorage;


cityForm.addEventListener('submit', function(e) {
    const cityInput = document.getElementById('favorite-city-name');
    addFavoriteCityToUI(cityInput.value);
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
    myStorage.clear();
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
    currentCity.removeChild(currentCity.getElementsByClassName('city-info')[0]);
    currentCity.removeChild(currentCity.getElementsByClassName('weather-info')[0]);
    currentCity.innerHTML += `
                        <div class="city-info">
                            <h3 class="city-info-name">${weatherData['name']}</h3>
                            <span class="city-info-temperature">${Math.round(weatherData['main']['temp_min'])}°C</span>
                            <div class="city-info-icon">
                                <img src="${getWeatherIcon(weatherData['weather'][0]['icon'])}" class="weather-icon" alt="">
                            </div>
                        </div>
                        <ul class="weather-info">
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Ветер</span>
                            <span class="weather-info-value">${weatherData['wind']['speed']} m/s, ${weatherData['wind']['deg']}</span>
                        </li>
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Облачность</span>
                            <span class="weather-info-value">${weatherData['weather'][0]['main']}</span>
                        </li>
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Давление</span>
                            <span class="weather-info-value">${weatherData['main']['pressure']} hpa</span>
                        </li>
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Влажность</span>
                            <span class="weather-info-value">${weatherData['main']['humidity']}%</span>
                        </li>
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Координаты</span>
                            <span class="weather-info-value">[${weatherData['coord']['lat']}, ${weatherData['coord']['lon']}]</span>
                        </li>
                        </ul>`;
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

    favoriteCitiesList.innerHTML += `
                            <li class="loader-on" id="favorite_${cityId}">
                                <div class="city-loader">
                                    <span>Подождите, данные загружаются</span>
                                    <div class="loader-icon"></div>
                                </div>
                            </li>
                        `;

    let weatherData = await getWeatherByCityName(cityName);

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
    const cityObject = document.getElementById(`favorite_${cityId}`);
    cityObject.innerHTML += `
                    <div class="city fav-city">
                        <div class="city-info">
                            <h3 class="city-info-name">${weatherData['name']}</h3>
                            <span class="city-info-temperature">${Math.round(weatherData['main']['temp_min'])}°C</span>
                            <div class="city-info-icon">
                                <img src="${getWeatherIcon(weatherData['weather'][0]['icon'])}" class="weather-icon" alt="">
                            </div>
                        </div>
                        <button class="round-button remove-button">&#xd7;</button>
                        <ul class="weather-info">
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Ветер</span>
                            <span class="weather-info-value">${weatherData['wind']['speed']} m/s, ${weatherData['wind']['deg']}</span>
                        </li>
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Облачность</span>
                            <span class="weather-info-value">${weatherData['weather'][0]['main']}</span>
                        </li>
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Давление</span>
                            <span class="weather-info-value">${weatherData['main']['pressure']} hpa</span>
                        </li>
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Влажность</span>
                            <span class="weather-info-value">${weatherData['main']['humidity']}%</span>
                        </li>
                        <li class="weather-info-item">
                            <span class="weather-info-feature">Координаты</span>
                            <span class="weather-info-value">[${weatherData['coord']['lat']}, ${weatherData['coord']['lon']}]</span>
                        </li>
                        </ul>
                    </div>`;
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