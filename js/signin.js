"use strict";

var signInForm = document.getElementById("sign-in-form");
var email = document.getElementById("email");
var password = document.getElementById("userpass");
var signInError = document.getElementById("signInError");
var aniState;
function step(timestamp) {
    var left = 2;
}

function startAnimation() {
    aniState = {
        }

    }
signInForm.addEventListener("submit", function(evt) {
    evt.preventDefault();

    firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then(function() {
            window.location = "map.html";
        })
        .catch(function(err) {
            signInError.classList.remove("hidden");
            // removed alert err.message so that it does a typical error message on a log in form
        });
        
    return false;
});