"use strict";

var signInForm = document.getElementById("sign-in-form");
var email = document.getElementById("email");
var password = document.getElementById("userpass");
var signInError = document.getElementById("signInError");

signInForm.addEventListener("submit", function(evt) {
    evt.preventDefault();

    firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then(function() {
            window.location = "map.html";
        })
        .catch(function(err) {
            signInError.classList.remove("hidden");
        });
        
    return false;
});

//if the user is already authenticated (meaning they rerouted back to sign in without sign out)
//redir them to maps. else do nothing.
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        window.location = "map.html";
    }
});