"use strict";

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

paper.install(window);
paper.setup(canvas);


var count = 20;
var raster = new Raster("rightFoot");
raster.scale(.05);
var symbol = new Symbol(raster);

for (var i = 0; i < count; i++) {
    var center = Point.random() * view.size;
	var placedSymbol = symbol.place(center);
    placedSymbol.destination = Point.random() * view.size;
    calculateAngle(placedSymbol);
    placedSymbol.left = 0;
    placedSymbol.right = 1;
    project.activeLayer.insertChild(i, placedSymbol);
}
function calculateAngle(item) {
    var vector = item.destination - item.position;
    item.angle = vector.angle;
    if (vector.angle > 1) {
        console.log(vector.angle);
        item.rotate(vector.angle + 45);
    } else {
        console.log(vector.angle);
        item.rotate(vector.angle + 90);
    }

}
function onFrame(event) {
    for (var i = 0; i < count; i++) { 
        var item = project.activeLayer.children[i];
        var diffPos = item.destination - item.position;
        if (event.count % 25 == 0) {

            if (item.right) {
                item.position += (diffPos / 10);
                item.left = 1;
                item.right= 0;
            } else {
                item.position += (diffPos / 30);
                item.right = 1;
                item.left = 0;
            }

        }
        if (diffPos.length < 30) {
            item.destination = Point.random() * view.size;
            calculateAngle(item);
        }

    }
}


function resizeCanvas() {
    var docElem = document.documentElement;
    canvas.width = docElem.clientWidth;
    canvas.height = docElem.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
