let devices = [];
let numberOfDeviceParameters;
let sliders = [];
let offset = 10;

let points = 6;
let slider_A;
let slider_B;
let slider_C;
let slider_D;
let step = 0;
let step2 = 0;

async function setup() {

  webAudioContextSetup();
  await RNBOsetup('export/patch.exportSAW.json', context); // Sound source
  await RNBOsetup('export/rnbo.shimmerev.json', context); 
  await RNBOsetup('export/rnbo.phaser.json', context); 
  devices[0].node.connect(devices[1].node);
  devices[1].node.connect(devices[2].node);  // Connect sound source to reverb 
  createOutputNode();
  makeP5jsSliders(0);
  makeP5jsSliders(1);
  makeP5jsSliders(2);
   

  console.log(devices); 
  
   
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 100);
}
 
function draw() {

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) {
  // Fetch from sliders
	//print(slider_B.value());
	background("black");
	translate(windowWidth/2, windowHeight/2);
	noFill();
	strokeWeight(7*cos(step)+13);
	for (i = 5; i < sliders[0].value() * 2; i+=5){
		push();
		if (i%10 == 0) 	stroke("black");
		else 						stroke("white");
		beginShape();
		for (let a = 0; a < TWO_PI; a += TWO_PI/sliders[0].value()) {
			let sx = cos(a) * i;
			let sy = sin(a) * i;
			vertex(sx, sy);
		}
		endShape(CLOSE); 
		pop();
		rotate(PI/(50*cos(step2)+50));
	}
	step += 0.2
	step2 += 0.01
  }
}
