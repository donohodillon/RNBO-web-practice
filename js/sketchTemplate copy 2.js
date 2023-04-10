let devices = [];
let numberOfDeviceParameters;
let sliders = [];
let offset = 10;
let parameterChanges = [];


let t = 0;


async function setup() {

  webAudioContextSetup();

  await RNBOsetup('export/patch.exportSAW.json', context); 
  // await RNBOsetup('export/rnbo.shimmerev.json', context); 
  await RNBOsetup('export/rnbo.phaser.json', context);
  await RNBOsetup('export/rnbo.overdrive.json', context); 
//   await RNBOsetup('export/rnbo.filterdelay.json', context);  

  devices[0].node.connect(devices[1].node);
  devices[1].node.connect(devices[2].node);
//   devices[2].node.connect(devices[3].node);
  // devices[2].node.connect(devices[3].node);
  createOutputNode();

  makeP5jsSliders(0);
  makeP5jsSliders(1);
  makeP5jsSliders(2);
//   makeP5jsSliders(3);
  
  createCanvas(windowWidth, windowHeight, WEBGL);
	ortho(-width / 2, width / 2, -height / 2, height / 2, -5000, 5000);
}
 
function draw() {

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) {

//   devices[0].parameters[0].value = mouseX;
//   devices[2].parameters[3].value = mouseY*10;
  
  background(0);

	lights();

	// directionalLight(color(255/2),0,0,-1);
	// directionalLight(color(255/2),1,0,0);
	let mappedValue = map(devices[0].parameters[0].value, devices[0].parameters[0].min, devices[0].parameters[0].max, 50, 300);
    let mappedValue2 = map(devices[0].parameters[0].value, devices[0].parameters[0].min, devices[2].parameters[2].max, 0, 0.15);
	let mappedValue3 = map(devices[1].parameters[2].value, devices[1].parameters[2].min, devices[1].parameters[2].max, 5, 15);
	let mappedValue4 = map(devices[1].parameters[1].value, devices[1].parameters[1].min, devices[1].parameters[1].max, 5, 35);

	let scl = mappedValue; //100*tan(.1*t%(PI/2));
	orbitControl();
	// rotateX(90);
	for (let v = 0; v < 1; v += 1 / 100) {
		for (let u = 0; u < 1; u += 1 / mappedValue4) {
			let x = (1 + sin(v + 1 * PI * u - t) * sin(1 * PI * v + t)) * sin(4 * PI * v + t);
			let y = (1 + sin(1 * PI * u - t) * sin(1 * PI * v + t)) * cos(4 * PI * v + t);
			let z = cos(1 * PI * u + t) * sin(1 * PI * v + t) + 4 * v - 2;

			x *= scl;
			y *= scl;
			z *= scl;

			if (v == 0) {
				pointLight(color(255), x, y, z);

			}

			push();
			translate(x, y, z);
			rotateX(x / scl);
			rotateY(y / scl);
			rotateZ(z / scl);
			noStroke();
			sphere(mappedValue3);
			pop();
		}
	}
	t += mappedValue2;
}

}