setTimeout(load,100);
function load() {
 requestAnimationFrame(mode);
}
function mode() {
//  console.log("g");

 var canvas = document.getElementsByTagName('canvas')[0];
 canvas.setAttribute("id", "canvas");
 canvas.width = 30;
        canvas.height = 30;

}
