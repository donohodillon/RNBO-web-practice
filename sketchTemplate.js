let device;
let numberOfDeviceParameters;
let sliders = [];

async function setup() {

  await RNBOsetup('export/patch.exportSAW.json');
  makeP5jsSliders(); 
  
  createCanvas(windowWidth, windowHeight);
}
 
function draw() {

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) {
  background(0);
    
  }
}
