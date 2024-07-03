setTimeout(load,60000);
function load() {
 requestAnimationFrame(mode);
}
function mode() {
//  console.log("g");

 var canvas = document.getElementsByTagName('canvas')[0];
 canvas.width = 30;
        canvas.height = 30;

}
