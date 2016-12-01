"use strict";

var currentUser;
var userSnapshot;
var locationRef = firebase.database().ref("locations");
var mapDiv = document.getElementById("map");

//coordinates for UW [latitude, longitude]
var seattleCoords = [47.6553, -122.3035];
//default zoom level (0-18 for street maps)
var defaultZoom = 15;

var map = buildMap(mapDiv, seattleCoords, defaultZoom);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        currentUser = user;
        document.getElementById("helloUser").textContent = user.displayName;
        if (navigator && navigator.geolocation) {
            navigator.geolocation.watchPosition(onPosition, onPositionError, geo_options);
        }   
        getUserLocation();
    } else {
        window.location = "index.html";
    }
});

function getUserLocation() {
    // check if current user's id exists in database
    var myLocation = locationRef.orderByChild("uid").equalTo(currentUser.uid);
    if (myLocation) {
        myLocation.on("value", function(snapshot) {
            userSnapshot = snapshot.val();
        });
    }
}

function buildMap(mapDiv, seattleCoords, defaultZoom) {
    var osmTiles = {
        url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    };

    var mapboxTiles = {
        accessToken: "pk.eyJ1IjoidGVzc2FldiIsImEiOiJjaXZsaTh3aGcwM3RvMm9udjg5MThhMmMwIn0.IotbIUV-uTjGdLEXWYOc9g",
        url: "https://api.tiles.mapbox.com/v4/{style}/{z}/{x}/{y}.png?access_token={accessToken}",
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        styles: {
            streets: "mapbox.streets",
            light: "mapbox.light",
            dark: "mapbox.dark",
            satellite: "mapbox.satellite",
            pirates: "mapbox.pirates"
        }
    }

    var map = L.map(mapDiv).setView(seattleCoords, defaultZoom);

    L.tileLayer(mapboxTiles.url, {
        attribution: mapboxTiles.attribution,
        style: mapboxTiles.styles.streets,
        accessToken: mapboxTiles.accessToken
    }).addTo(map);

    return map;
};

function onPosition(position) {
    var latlng = [position.coords.latitude, position.coords.longitude];
    var userLocationRef;
    if (!userSnapshot) {
        var location = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            currentLocation: {
                coords: latlng,
                createdOn: firebase.database.ServerValue.TIMESTAMP
            }
        };

        locationRef.push(location);

    } else {
        var keys = Object.keys(userSnapshot);
        userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + keys[0]);
        userLocationRef.update({currentLocation: {
            coords: latlng,
            createdOn: firebase.database.ServerValue.TIMESTAMP
        }});
    }
}

function onPositionError(err) {
    alert(err.message);
}

var geo_options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 270000000000
};

var markers = []; 

function clearMarkers() {
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
}

function renderLocation(snapshot) {
    var user = snapshot.val();

    var marker = L.marker(user.currentLocation.coords).addTo(map);
    markers.push(marker);
}

function render(snapshot) {
    // clear all markers off the map
    clearMarkers();
    // render each of the tasks
    snapshot.forEach(renderLocation);
}

locationRef.on("value", render);

document.getElementById("sign-out-button").addEventListener("click", function () {
    firebase.auth().signOut();
});
