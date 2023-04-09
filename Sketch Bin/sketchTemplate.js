let devices = [];
let numberOfDeviceParameters;
let sliders = [];
let offset = 10;

let f = 0;


async function setup() {

  webAudioContextSetup();

  await RNBOsetup('export/patch.exportSAW.json', context); 
  // await RNBOsetup('export/rnbo.shimmerev.json', context); 
  await RNBOsetup('export/rnbo.phaser.json', context);
  await RNBOsetup('export/rnbo.overdrive.json', context);  

  devices[0].node.connect(devices[1].node);
  devices[1].node.connect(devices[2].node);
  // devices[2].node.connect(devices[3].node);
  createOutputNode();

  makeP5jsSliders(0);
  makeP5jsSliders(1);
  makeP5jsSliders(2);
  
  createCanvas(windowWidth, windowHeight, WEBGL);
	noStroke();
}
 
function draw() {

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) {

  devices[0].parameters[0].value = mouseX;
  devices[2].parameters[3].value = mouseY*10;
  
  [3, 3, -3].map(i => pointLight([devices[0].parameters[0].value], 0, -400 * i, 0));
	let e = 180+(devices[0].parameters[0].value/4);
	rotateY(f / e);
	for (y = -e; y <= e; y += 30) {
		for (z = -e; z <= e; z += 30) {
			for (x = -e; x <= e; x += 30) {
				let Y = y - f % 30;
				let E = e - dist(0, 0, 0, x, Y, z);
				push();
				translate(x, Y, z);
				if (E > 0) sphere(E / 4, 33);
				pop();
			}
		}
	}
	box(2000);
	f++;
    
  }
}
 