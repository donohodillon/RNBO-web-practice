let device;
let numberOfDeviceParameters;
let sliders = [];

async function setup() {
  await RNBOsetup('export/patch.simple-sampler-export2.json');
  console.log("device.parameters:", device.parameters);
  makeP5jsSliders();
  console.log("Sliders array:", sliders);
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
}

 