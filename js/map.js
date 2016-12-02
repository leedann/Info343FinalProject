"use strict";

var currentUser;
var markers = []; 
var locationRef = firebase.database().ref("locations");
var mapDiv = document.getElementById("map");
var searchForUser = document.getElementById("user-search");

//coordinates for UW [latitude, longitude]
var seattleCoords = [47.6553, -122.3035];
//default zoom level (0-18 for street maps)
var defaultZoom = 15;

var map = buildMap(mapDiv, seattleCoords, defaultZoom);

var geo_options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 270000000000
};

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        currentUser = user;
        document.getElementById("helloUser").textContent = user.displayName;

        if (navigator && navigator.geolocation) {
            navigator.geolocation.watchPosition(onPosition, onPositionError, geo_options);
        } 
    } else {
        window.location = "index.html";
    }
});

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

    var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
    userLocationRef.update({
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        isHidden: false,
        currentLocation: {
            coords: latlng,
            createdOn: firebase.database.ServerValue.TIMESTAMP
        }});
}

function onPositionError(err) {
    alert(err.message);
}

function clearMarkers() {
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
}

function renderLocation(snapshot) {
    var user = snapshot.val();
    if (!user.isHidden && user.uid != currentUser.uid) { //If the user is in private mode and it's NOT the user themself
        var marker = L.marker(user.currentLocation.coords).addTo(map);
        markers.push(marker);
    }
}

function render(snapshot) {
    clearMarkers();
    snapshot.forEach(renderLocation);
}

function togglePrivateMode() {
    var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
    userLocationRef.update({
        isHidden: !currentUser.isHidden
    });
    console.log(currentUser.isHidden);
}

locationRef.on("value", render);

document.getElementById("sign-out-button").addEventListener("click", function () {
    firebase.auth().signOut();
});

document.getElementById("invisibility-cloak").addEventListener("click", togglePrivateMode);
