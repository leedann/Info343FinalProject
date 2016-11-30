"use strict";

var signUpForm = document.getElementById("sign-up-form");
var firstName = document.getElementById("first-name");
var lastName = document.getElementById("last-name");
var email = document.getElementById("email");
var password = document.getElementById("userpass");
var passConfirm = document.getElementById("userpass-confirm");

signUpForm.addEventListener("submit", function(evt) {
    evt.preventDefault();

    if (password.value != passConfirm.value) {
        console.log("Password does not match!");
    }
    //somewhere around here check if .edu

    if (firstName.value && 
        lastName.value && 
        email.value &&
        (password.value == passConfirm.value)) {
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
