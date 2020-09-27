// register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('service-worker.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// api details
const api = {
    apikey: '5290defddab27e09fb2b75fd44ba25f4',
    cUrl: 'https://api.openweathermap.org/data/2.5/weather?',
    dUrl: 'https://api.openweathermap.org/data/2.5/onecall?',
    iconUrl: 'https://openweathermap.org/img/wn/'
}

// returns the url for searching with a name
const weatherByName = (timezone) => {
    return `${api.cUrl}q=${timezone}&APPID=${api.apikey}&units=metric`;
}

// return the url for search with coordinate
const weatherByCoord = (lat, lon) => {
    return [`${api.cUrl}lat=${lat}&lon=${lon}&APPID=${api.apikey}&units=metric`,
    `${api.dUrl}lat=${lat}&lon=${lon}&appid=${api.apikey}&units=metric&cnt=8`]
}

// run getLocation when pages loads... 
//this will also run getWeather with the location of the user...
//obtained from getLocation
window.onload = function () {
    init();
};



// checks if an object is empty or not
const checkObj = (obj) => {
    for (var i in obj) return true;
    return false;
}

// get local data for display if exists
const init = () => {
    const data = localStorage.getItem('weatherData') ? JSON.parse(localStorage.getItem('weatherData')) : {};
    const data2 = localStorage.getItem('dailyWeather') ? JSON.parse(localStorage.getItem('dailyWeather')) : {};
    const timezone = data.name;
    const oldDate = new Date((data.dt) * 1000).getDate().toLocaleString();
    console.log(oldDate);
    const today = new Date().getDate().toLocaleString();;
    console.log(today);
     
    const date = new Date(data.headers);
    console.log('here I am:',date);
    // if cached file is older than 6 hours
    // if(Date.now() > date.getTime() + 1000 * 60 * 60 * 6){
    //   return fetch(url);
    // }
    //     caches.keys().then(cacheNames => {
    //         return Promise.all(
    //           cacheNames.map(cacheName => {
    //              caches.delete(cacheName);
    //              localStorage.clear();
    //              console.log('hello:')
    //           })
    //         );
    //       })
    //       searchQuery(timezone);
    // }
    
    // if (checkObj(data)) {
    //     addRemoveStyle();
    //     getCurrentData(data);
    // };
    // if (checkObj(data2)) { 
    //     getDailyData(data2);
    //  };
}

// query api for current weather info
const getCurrentWeather = (url) => {
    fetch(url).then(response => {
        if (response.status == 200) {
            // console.log('response', response);
            response.json().then(data => {
                localStorage.setItem('weatherData', JSON.stringify(data))
                // console.log('data', data);
                getCurrentData(data);
            }).catch(ex => {
                console.log(ex);
            });
        }
    }).catch(err => {
        console.log(err);
    });
}

// query api for daily weather info
const getDailyWeather = (url) => {
    fetch(url).then(response => {
        if (response.status == 200) {
            // console.log('response', response);
            response.json().then(data => {
                localStorage.setItem('dailyWeather', JSON.stringify(data))
                // console.log('data', data);
                getDailyData(data)               
            }).catch(ex => {
                console.log(ex);
            });
        }
    }).catch(err => {
        console.log(err);
    });
}

//this gets the current weather api json, parse it and render to the page
const getCurrentData = (data) => {
    let [currentTime] = dateBuilder(data.dt);
    const check = data.weather[0].description.indexOf('rain');
    const status = check == -1 ? '<div class="safe">Safe to go out</div>' : '<div class="not-safe">Its Not safe</div>';
    // console.log('check: ', check);
    const output = `
    <section class="location">
        <div class="city">${data.name}, ${data.sys.country}</div>
        <div class="date">${currentTime}</div>
    </section>
    <div class="current">
        <div class="temp">${Math.round(data.main.temp)}<span>°c<img alt="weather icon" class="icon" src="${api.iconUrl}${data.weather[0].icon}@2x.png"></span></div>
        <div class="weather">${data.weather[0].description}</div>
        <div class="hi-low">${Math.round(data.main.temp_min)}°c/${Math.round(data.main.temp_max)}°c</div>
        ${status}
    </div>`;
    document.querySelector('#main').innerHTML = output;
}

// this gets the daily weather api json, parse it and render to the page
const getDailyData = (data) => {
    let output = `
    <h3 id="dtitle">Daily Weather for the Week</h3>
    <table border="0">
    <thead>
        <th class="align-left">Day</th>
        <th>Weather</th>
        <th>Description</th>
        <th>Temp</th>
        <th>Humidity</th>
        <th>Wind</th>
    </thead>
    <tbody>`;
    for (let i = 1; i < data.daily.length; i++) {
        let [currentTime, day] = dateBuilder(data.daily[i].sunrise);
        output += `<tr>
        <th class="align-left">${day}<br><small>${currentTime.substring(currentTime.indexOf(',') + 1, currentTime.lastIndexOf(','), 1)}</small></th>
        <td class="icon"><small><img  alt="weather icon" class="iconImg" src="${api.iconUrl}${data.daily[i].weather[0].icon}.png"></small></td>
        <td><small>${data.daily[i].weather[0].description}</small></td>
        <td>${Math.round(data.daily[i].temp.min)}°c / ${Math.round(data.daily[i].temp.max)}°c</td>
        <td>${data.daily[i].humidity}%</td>
        <td>${data.daily[i].wind_speed}km/hr</td>
        </tr>`;
    }
    output += `</tbody>
              </table> <br/><br/><br/>`;
    document.querySelector('#dailyWeather').innerHTML = output;
}

// query the user query and query the api
const searchQuery = (timeZone) => {
    // console.log(timeZone);
    let lon, lat;
    const currenUrl = weatherByName(timeZone);
    
    fetch(currenUrl).then(response => {
        if (response.status == 200) {
            // console.log('response', response);
            response.json().then(data => {
                location = data.name;
                lon = data.coord.lon;
                lat = data.coord.lat;
                let [, dailyUrl] = weatherByCoord(lat, lon);
                getDailyWeather(dailyUrl);
                getCurrentWeather(currenUrl);
            }).catch(ex => {
                console.log(ex);
            });
        } else {
            alert('sorry, location not found. Check the spelling and try again!')
        }
    }).catch(err => {
        console.log(err);
    });
}

// gets the search term and list for 'enter' key press
const search = document.querySelector('#searchTerm');
search.addEventListener('keypress', function (e) {
    const searchTerm = search.value;
    if (searchTerm) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addRemoveStyle();
            searchQuery(searchTerm.trim());

        }
    }
});

// listens for click event from the search box
const submit = document.querySelector('#submit');
submit.addEventListener('click', function (e) {
    const searchTerm = document.querySelector('#searchTerm').value;
    e.preventDefault();
    if (searchTerm) {
        addRemoveStyle();
        searchQuery(searchTerm.trim());
    }
    else alert('Please enter a country, city or town');
});

// date builder
const dateBuilder = (currentDate) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let dat = (currentDate) * 1000;
    const dateTime = new Date(dat).toLocaleString();
    const dt = new Date(dat);
    // console.log(dt);
    let day = days[dt.getDate()];
    let currentTime = `${day}, ${dateTime}`

    return [currentTime, day];
}

const addRemoveStyle = () => {
    document.querySelector('#weatherWrap')
        .setAttribute("style", " -webkit-column-rule: 1px double #ddd;-moz-column-rule: 1px double #ddd; column-rule: 1px double #ddd;");
    document.querySelector('#topHeader').setAttribute("style", "position: initial; top: 0;  transition: 0.2s ease-out;");
}