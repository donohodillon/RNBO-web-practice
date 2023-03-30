let device;
let numberOfDeviceParameters;
let sliders = [];

async function setup() {
  await RNBOsetup('export/patch.exportSAW.json');
  makeP5jsSliders();
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220); 
}