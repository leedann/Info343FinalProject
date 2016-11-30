"use strict";

var signInForm = document.getElementById("sign-in-form");
var email = document.getElementById("email");
var password = document.getElementById("userpass");

signInForm.addEventListener("submit", function(evt) {
    evt.preventDefault();

    firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then(function() {
            window.location = "map.html";
        })
        .catch(function(err) {
            alert(err.message);
        });
        
    return false;
});