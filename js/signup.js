"use strict";

var signUpForm = document.getElementById("sign-up-form");
var firstName = document.getElementById("first-name");
var lastName = document.getElementById("last-name");
var email = document.getElementById("email");
var password = document.getElementById("userpass");
var passConfirm = document.getElementById("userpass-confirm");
var emailNotUW = document.getElementById("notUW");
var passNotMatch = document.getElementById("noMatch");

passConfirm.addEventListener("input", function() {
    if (password.value != passConfirm.value) {
        passNotMatch.classList.remove("hidden");
    }else {
        passNotMatch.classList.add("hidden");
    }
});

email.addEventListener("focusout", function() {
    if (email.value) {
        if (!email.value.endsWith("@uw.edu")) {
            emailNotUW.classList.remove("hidden");
        } else {
            emailNotUW.classList.add("hidden");
            uwCheck= true;
        }
    }
});

signUpForm.addEventListener("submit", function(evt) {
    evt.preventDefault();
    var uwCheck= false;

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
