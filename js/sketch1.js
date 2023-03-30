let device;
let numberOfDeviceParameters;
let sliders = [];

function setup() {
  RNBOsetup('export/patch.exportSAW.json', sliders, device);
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  ellipse (20,20,200);
}  