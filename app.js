const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const humidityElement = document.querySelector(".humidity-value p");
const pressureElement = document.querySelector(".pressure-value p");
const windElement = document.querySelector(".wind-value p");
const dateElement = document.querySelector(".date-value p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");

$(document).ready(function() {
  $(this).scrollTop(0);
  $(".fa-angle-double-down").click(function() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (w < 800) {
      window.scrollBy(0, 600);
    } else {
      window.scrollBy(0, 700);
    }
    console.log("w:" + w + "h:" + h);
  });
});
// App data
var weather = {
  tempArray: [],
  dayArray: [],
  humidityArray: [],
  pressureArray: [],
  windArray: []
};
weather.temperature = {
  unit: "celsius"
}

// CHECK IF BROWSER SUPPORTS GEOLOCATION
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation</p>";
}

// SET USER'S POSITION
function setPosition(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;

  getWeather(latitude, longitude);
}

// SHOW ERROR WHEN THERE IS AN ISSUE WITH GEOLOCATION SERVICE
function showError(error) {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

// GET WEATHER FROM API PROVIDER
function getWeather(latitude, longitude) {
  let api = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=hourly,minutely&units=metric&appid=28745a6619d7926132d392121ffc0a25";

  fetch(api).then(function(response) {
    let data = response.json();
    return data;
  }).then(function(data) {
    weather.temperature.value = Math.floor(data.current.temp);
    weather.description = data.current.weather[0].description;
    weather.iconId = data.current.weather[0].icon;
    weather.humidity = data.current.humidity;
    weather.pressure = data.current.pressure;
    weather.wind = data.current.wind_speed;

    var latitude = data.lat;
    var longitude = data.lon;

    var api_url = 'https://api.opencagedata.com/geocode/v1/json'

    var request_url = api_url + '?' + 'key=f845b5ef0dee465ca157ad12da68deb9' + '&q=' + encodeURIComponent(latitude + ',' + longitude) + '&pretty=1' + '&no_annotations=1';

    // see full list of required and optional parameters:
    // https://opencagedata.com/api#forward

    var request = new XMLHttpRequest();
    request.open('GET', request_url, true);

    request.onload = function() {
      // see full list of possible response codes:
      // https://opencagedata.com/api#codes

      if (request.status === 200) {
        // Success!
        var data = JSON.parse(request.responseText);
        weather.place = data.results[0].formatted;
        locationElement.innerHTML = `<i class="fa fa-map-marker" aria-hidden="true"></i> ` + weather.place;
      } else if (request.status <= 500) {
        // We reached our target server, but it returned an error

        console.log("unable to geocode! Response code: " + request.status);
        var data = JSON.parse(request.responseText);
        console.log('error msg: ' + data.status.message);
      } else {
        console.log("server error");
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      console.log("unable to connect to server");
    };

    request.send(); // make the request
    // request.send();  make the request
    // weather.city = data.name;
    // weather.country = data.sys.country;
    for (var i = 1; i <= 7; i++) {
      weather.dayArray.push(convert(data.daily[i].dt));
      weather.tempArray.push(data.daily[i].temp.day);
      weather.humidityArray.push(data.daily[i].humidity);
      weather.pressureArray.push(data.daily[i].pressure);
      weather.windArray.push(data.daily[i].wind_speed);
    }
    plotTempGraph(weather.tempArray, weather.dayArray);
    plotHumidityGraph(weather.humidityArray, weather.dayArray);
    plotPressureGraph(weather.pressureArray, weather.dayArray);
    plotWindGraph(weather.windArray, weather.dayArray);
  }).then(function() {
    displayWeather();
  });
}
function addC(temp) {
  return temp + "&#8451;";
}
function convert(time) {
  let unix_timestamp = time;

  var months_arr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(unix_timestamp * 1000);
  // Hours part from the timestamp
  var month = months_arr[date.getMonth()];
  var day = date.getDay();
  var year = date.getFullYear();
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();
  var formattedTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  var days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  var formattedDay = days[day];
  return formattedDay;
}
function plotTempGraph(tempArray, dayArray) {
  if (window.myChart1 != null) {
    window.myChart1.destroy();
  }
  var ctt = document.getElementById("Tchart");
  window.myChart1 = new Chart(ctt, {
    type: 'line',
    data: {
      labels: dayArray,
      datasets: [
        {
          label: 'TEMPERATURE(°C)', // Name the series
          data: tempArray, // Specify the data values array
          fill: false,
          borderColor: '#2196f3', // Add custom color border (Line)
          backgroundColor: '#fff', // Add custom color background (Points and Fill)
          borderWidth: 1 // Specify bar border width
        }
      ]
    },
    options: {
      responsive: true, // Instruct chart js to respond nicely.
      maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
    }
  });
}
function plotHumidityGraph(humidityArray, dayArray) {
  if (window.myChart2 != null) {
    window.myChart2.destroy();
  }
  var cth = document.getElementById("Hchart");

  window.myChart2 = new Chart(cth, {
    type: 'line',
    data: {
      labels: dayArray,
      datasets: [
        {
          label: 'HUMIDITY(%)', // Name the series
          data: humidityArray, // Specify the data values array
          fill: false,
          borderColor: '#2196f3', // Add custom color border (Line)
          backgroundColor: '#fff', // Add custom color background (Points and Fill)
          borderWidth: 1 // Specify bar border width
        }
      ]
    },
    options: {
      responsive: true, // Instruct chart js to respond nicely.
      maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
    }
  });
}
function plotPressureGraph(pressureArray, dayArray) {
  if (window.myChart3 != null) {
    window.myChart3.destroy();
  }
  var ctp = document.getElementById("Pchart");

  window.myChart3 = new Chart(ctp, {
    type: 'line',
    data: {
      labels: dayArray,
      datasets: [
        {
          label: 'PRESSURE(hPa)', // Name the series
          data: pressureArray, // Specify the data values array
          fill: false,
          borderColor: '#2196f3', // Add custom color border (Line)
          backgroundColor: '#fff', // Add custom color background (Points and Fill)
          borderWidth: 1 // Specify bar border width
        }
      ]
    },
    options: {
      responsive: true, // Instruct chart js to respond nicely.
      maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
    }
  });
}
function plotWindGraph(windArray, dayArray) {
  if (window.myChart4 != null) {
    window.myChart4.destroy();
  }
  var ctw = document.getElementById("Wchart");

  window.myChart4 = new Chart(ctw, {
    type: 'line',
    data: {
      labels: dayArray,
      datasets: [
        {
          label: 'Wind Speed (metre/sec)', // Name the series
          data: windArray, // Specify the data values array
          fill: false,
          borderColor: '#2196f3', // Add custom color border (Line)
          backgroundColor: '#fff', // Add custom color background (Points and Fill)
          borderWidth: 1 // Specify bar border width
        }
      ]
    },
    options: {
      responsive: true, // Instruct chart js to respond nicely.
      maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
    }
  });
}
function get(city) {
  var weather
  const L_url = "https://www.mapquestapi.com/geocoding/v1/address?key=34qi3Gx6ukGEp1ZgEbXTAw0Z9vdvghMN" + "&location=" + city;
  fetch(L_url).then(function(l_response) {
    let l_data = l_response.json();
    return l_data;
  }).then(function(l_data) {
    var lat = l_data.results[0].locations[0].latLng.lat;
    var lng = l_data.results[0].locations[0].latLng.lng;
    var W_url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lng + "&exclude=hourly,minutely&units=metric&appid=28745a6619d7926132d392121ffc0a25";
    fetch(W_url).then(function(w_response) {
      let w_data = w_response.json();
      return w_data;
    }).then(function(w_data) {
      console.log(w_data);
      var weather_data = {
        tempArray: [],
        dayArray: [],
        humidityArray: [],
        pressureArray: [],
        windArray: []
      };
      weather_data.iconId = w_data.current.weather[0].icon;
      iconElement.innerHTML = `<img src="http://openweathermap.org/img/wn/${weather_data.iconId}@2x.png" />`;
      weather_data.temperature = w_data.current.temp;
      tempElement.innerHTML = `${weather_data.temperature}°<span>C</span>`;
      weather_data.description = w_data.current.weather[0].description;
      descElement.innerHTML = weather_data.description;
      weather_data.humidity = w_data.current.humidity;
      humidityElement.innerHTML = "HUMIDITY:  " + weather_data.humidity + "%";
      weather_data.pressure = w_data.current.pressure;
      pressureElement.innerHTML = "PRESSURE:  " + weather_data.pressure + "KPa";
      weather_data.wind = w_data.current.wind_speed;
      windElement.innerHTML = "WIND SPEED:" + weather_data.wind + " metre/sec";
      var d = new Date();
      dateElement.innerHTML = d;
      locationElement.innerHTML = `<i class="fa fa-map-marker" aria-hidden="true"></i> ` + city;
      for (var i = 1; i <= 7; i++) {
        weather_data.dayArray.push(convert(w_data.daily[i].dt));
        weather_data.tempArray.push(w_data.daily[i].temp.day);
        weather_data.humidityArray.push(w_data.daily[i].humidity);
        weather_data.pressureArray.push(w_data.daily[i].pressure);
        weather_data.windArray.push(w_data.daily[i].wind_speed);
      }
      plotTempGraph(weather_data.tempArray, weather_data.dayArray);
      plotHumidityGraph(weather_data.humidityArray, weather_data.dayArray);
      plotPressureGraph(weather_data.pressureArray, weather_data.dayArray);
      plotWindGraph(weather_data.windArray, weather_data.dayArray);
    });
  });
}
// DISPLAY WEATHER TO UI
function displayWeather() {
  var d = new Date();
  dateElement.innerHTML = d;
  iconElement.innerHTML = `<img src="http://openweathermap.org/img/wn/${weather.iconId}@2x.png" />`;
  tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
  descElement.innerHTML = weather.description;
  humidityElement.innerHTML = "HUMIDITY:  " + weather.humidity + "%";
  pressureElement.innerHTML = "PRESSURE:  " + weather.pressure + "KPa";
  windElement.innerHTML = "WIND SPEED:" + weather.wind + " metre/sec";

}
