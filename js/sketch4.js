let devices = [];
let numberOfDeviceParameters;
let sliders = [];

let points = 6;
let slider_A;
let slider_B;
let slider_C;
let slider_D;
let step = 0;
let step2 = 0;

async function setup() {

  await RNBOsetup('export/patch.exportSAW.json');
  makeP5jsSliders(0); 
  
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 100);
	// Setup Sliders
	// slider_A = createSlider(3, 20, 3);
	// slider_A.position(5, 5);
	// slider_A.style('width', '100px');
	// slider_B = createSlider(1, 1000, 250);
	// slider_B.position(5, 25);
	// slider_B.style('width', '100px');
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
