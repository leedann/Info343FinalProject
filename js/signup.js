"use strict";

var signUpForm = document.getElementById("sign-up-form");
var firstName = document.getElementById("first-name");
var lastName = document.getElementById("last-name");
var email = document.getElementById("email");
var password = document.getElementById("userpass");
var passConfirm = document.getElementById("userpass-confirm");
var emailNotUW = document.getElementById("notUW");
var passNotMatch = document.getElementById("noMatch");

signUpForm.addEventListener("submit", function(evt) {
    evt.preventDefault();
    var uwCheck= false;

    if (password.value != passConfirm.value) {
        passNotMatch.classList.toggle("hidden");
    }
    if (email.value) {
        if (!email.value.endsWith("@uw.edu")) {
            emailNotUW.classList.toggle("hidden");
        } else {
            uwCheck= true;
        }
    }

    if (firstName.value && 
        lastName.value && 
        email.value &&
        uwCheck &&
        (password.value === passConfirm.value)) {
            firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
                .then(function(user) {
                    //do email verification here
                    return user.updateProfile({
                        displayName: firstName.value + " " + lastName.value
                    });
                })
                .then(function() {
                    window.location = "map.html";
                })
                .catch(function(err) {
                    alert(err.message);
                });
            }

    return false;
});
