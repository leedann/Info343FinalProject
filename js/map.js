"use strict";

var currentUser;
var markers = [];
var toggleIsHidden = false; 
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
        var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
        if (userLocationRef) {
            userLocationRef.update({
            isHidden: true   //Hide the user when they sign out
            }); 
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
        accessToken: "pk.eyJ1IjoiZGFuaWVsbWVyY2hhbnQiLCJhIjoiY2l2bXAyZ2kzMGFzdjJ6bHYyZHh2aXV6cSJ9.sLMUElBbbrDnDnjrU-B6pg",
        url: "https://api.mapbox.com/styles/v1/danielmerchant/ciwb7o8e3003n2qp44jy5u379/tiles/256/{z}/{x}/{y}?access_token={accessToken}",        
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>, Icons by Jule Steffen & Matthias Schmidt',
        styles: {
            streets: "mapbox.streets",
            light: "mapbox.light",
            dark: "mapbox.dark",
            satellite: "mapbox.satellite",
            pirates: "mapbox.pirates",
        }
    }
    var map = L.map(mapDiv).setView(seattleCoords, defaultZoom);

    L.tileLayer(mapboxTiles.url, {
        attribution: mapboxTiles.attribution,
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
        isHidden: toggleIsHidden,
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
    if (user.isHidden == false) { //If the user is in private mode and it's NOT the user themself
        var customIcon = L.icon({
            iconUrl: 'img/footprint.svg', 
            iconSize: [20, 20]
        });
        var marker = L.marker(user.currentLocation.coords, {icon: customIcon}).addTo(map);
        markers.push(marker);
    }
}

function render(snapshot) {
    clearMarkers();
    snapshot.forEach(renderLocation);
}

function togglePrivateMode() { 
    var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
    toggleIsHidden = !toggleIsHidden;
    userLocationRef.update({
        isHidden: toggleIsHidden
    });
}

locationRef.on("value", render);

document.getElementById("sign-out-button").addEventListener("click", function () {
    var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
    userLocationRef.update({
        isHidden: true   //Hide the user when they sign out
    });
    firebase.auth().signOut();
});

document.getElementById("invisibility-cloak").addEventListener("click", togglePrivateMode);

