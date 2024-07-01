setTimeout(load,60000);
function load() {
setInterval(mode,100);
}
function mode() {
//  console.log("g");
 // document.getElementsByTagName('canvas')[0].setAttribute("id", "canvas");
  var g = document.createElement('canvas');
g.setAttribute("id", "canvas");
  var sourceCanvas = document.getElementsByTagName('canvas')[0];
  var sourceCanvas = destinationCanvas.getElementsId('canvas');
  let srcCtx = sourceCanvas.getContext('2d');
let destCtx = destinationCanvas.getContext('2d');

destCtx.drawImage(sourceCanvas, 0, 0);
  
// var g = document.createElement('canvas');
// g.setAttribute("id", "canvas");
//   document.body.appendChild(g);
}
