"use strict";

var currentUser;

 firebase.auth().onAuthStateChanged(function(user) {
     if (user) {
         console.log(user);
         currentUser = user;
        document.getElementById("helloUser").textContent = user.displayName;
     }else {
         window.location = "index.html";
     }
 });

 document.getElementById("sign-out-button").addEventListener("click", function() {
    firebase.auth().signOut();
});