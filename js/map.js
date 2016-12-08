"use strict";

var currentUser;
var markers = [];
var userPositionID;
var refSnapshot;
var toggleIsHidden = false; 
var locationRef = firebase.database().ref("locations");
var mapDiv = document.getElementById("map");
var searchForUser = document.getElementById("user-search");
var house = document.getElementById('house');

document.getElementById("top-navbar").style.height = "60px";

//coordinates for UW [latitude, longitude]
var seattleCoords = [47.6553, -122.3035];
//default zoom level (0-18 for street maps)
var defaultZoom = 18;

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
            userPositionID = navigator.geolocation.watchPosition(onPosition, onPositionError, geo_options);
        }
        var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
        if (userLocationRef) {
            userLocationRef.update({
            isHidden: true // Hide the user when they sign out
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
    if (user.isHidden == false) { 
        var customIcon = L.icon({
            iconUrl: 'img/footprint.svg', 
            iconSize: [20, 20],
            className: 'icon'
        }); 
        var marker = L.marker(user.currentLocation.coords, {icon: customIcon,
                                                            alt: 'footprints',
        opacity: 0.75}).addTo(map).bindPopup('<div><p><img src=\'img/gryffindor.jpg\' alt=\'gryffindor\' height=\'30\' width=\'30\'/><span>  ' + user.displayName + '</span></p></div>');
        markers.push(marker);
    }
    if (user.uid === currentUser.uid) {
        map.panTo(user.currentLocation.coords);
    }
}

function render(snapshot) {
    refSnapshot = snapshot;
    clearMarkers();
    refSnapshot.forEach(renderLocation);
}

function togglePrivateMode() { 
    var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
    toggleIsHidden = !toggleIsHidden;
    userLocationRef.update({
        isHidden: toggleIsHidden
    });
}

function distortUserLocation() {
    var userCoords;
    var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
    refSnapshot.forEach(function(snapshot) {
        if (snapshot.val().uid === currentUser.uid) {
            userCoords = snapshot.val().currentLocation.coords;
        }
    });
    var lat = getRandomArbitrary(userCoords[0] - 0.0009105, userCoords[0] + 0.0009105);
    var lng = getRandomArbitrary(userCoords[1] - 0.001196, userCoords[1] + 0.001196);

    navigator.geolocation.clearWatch(userPositionID);

    userLocationRef.update({
        currentLocation: {
            coords: [lat, lng],
            createdOn: firebase.database.ServerValue.TIMESTAMP
    }}); 

    // takes function and time interval (in millaseconds), function is called after specified interval
    setTimeout(countdown, 1000);
}

var timeout = 10; // seconds
function countdown() {
    var castSpellButton = document.getElementById("apparation");
    var timer = document.getElementById("timer");
    var minutes = Math.floor((timeout/60) % 60 );
    var seconds = Math.floor(timeout - (minutes * 60));
    timer.textContent = minutes + ":" + seconds;
    timeout--;
    if (timeout > 0) {
        timer.style.display = "block";
        castSpellButton.disabled = true;
        setTimeout(countdown, 1000);
    } else {
        if (navigator && navigator.geolocation) {
            userPositionID = navigator.geolocation.watchPosition(onPosition, onPositionError, geo_options);
        }   
        castSpellButton.disabled = false;

    }
}

// http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

document.getElementById("invisibility-cloak").addEventListener("click", togglePrivateMode);
document.getElementById("apparation").addEventListener("click", distortUserLocation);
document.getElementById('house').addEventListener("change", changeHouseAffiliation);

locationRef.on("value", render);

var signOutButtons = document.querySelectorAll(".sign-out-button");

// iterate over sign out button nodeList, adding an "click" event listener to each
for (let i = 0; i < signOutButtons.length; i++) {
    signOutButtons[i].addEventListener("click", function() {
        var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
        userLocationRef.update({
            isHidden: true // Hide the user when they sign out
        });
        firebase.auth().signOut();
    });
}

function changeHouseAffiliation() {
    var userLocationRef = firebase.database().ref(locationRef.path.o[0] + "/" + currentUser.uid);
    userLocationRef.update({
        color: house.value
    });
}