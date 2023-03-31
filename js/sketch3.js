let device;
let numberOfDeviceParameters;
let sliders = [];
let sliderValue;
let sliderValue2;

let f = 0;

async function setup() {

  await RNBOsetup('export/patch.exportSAW.json');
  makeP5jsSliders(); 

  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(120);
  noStroke();
}

function draw() {

  // Map mouseX to the slider range and set the slider value
  

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) { 
	let mappedX = map(mouseX, 0, width, 0, 100);
	let mappedY = map(mouseY, 0, height, 0, -10);
	
	device.parameters[0].value = mappedX
	device.parameters[1].value = mappedY
    sliderValue = mappedX;
    sliderValue2 = mappedY;
    [3, 3, -3].map(i => pointLight([255], 0, -400 * i, 0));
    let e = 180;
    rotateY((f + ((100 - sliderValue) * 50)) / e);
    for (y = -e; y <= e; y += 30) {
      for (z = -e; z <= e; z += 30) {
        for (x = -e; x <= e; x += 30) {
          let Y = y - f % 30;
          let E = e - dist(0, 0, 0, x, Y, z);
          push();
          translate(x, Y, z);
          if (E > 0) sphere((E / 4) * ((-20 - sliderValue2*2) / 15), 33);
          pop();
        }
      }
    }
    box(2000);
    f++;
  }
}

