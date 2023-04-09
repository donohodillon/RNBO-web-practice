let devices = [];
let numberOfDeviceParameters;
let sliders = [];
let offset = 10;

let palette = ["#2A7135", "#A38046", "#EEEEEE", "#F4B600", "#DD2720"];
let ease;


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
  
  createCanvas(800, 800, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);
  ease = new p5.Ease();
  shuffle(palette,true);
  ortho(-width / 2, width / 2, -height / 2, height / 2, -5000, 5000);
}
 
function draw() {

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) {

  devices[0].parameters[0].value = mouseX;
  devices[2].parameters[3].value = mouseY*10;
  
  randomSeed(frameCount/150);
  
  background(0,0,0);
  noStroke();
  beginShape();
  fill(palette[0]);
  vertex(-width,-height/2,-2500);
  fill(palette[1]);
  vertex(width,-height/2,-2500);
  fill(palette[2]);
  vertex(width,height/2,-2500);
  fill(palette[3]);
  vertex(-width,height/2,-2500);
  endShape();

  // background(palette[0]);

  // lights();
  ambientLight(0, 0, 100);
  directionalLight(color(0, 0, 100), 0, 0, 1);
  directionalLight(color(0, 0, 100), 0, 0, -1);
  directionalLight(color(0, 0, 100), 0, 1, 0);
  directionalLight(color(0, 0, 100), 0, -1, 0);
  directionalLight(color(0, 0, 100), 1, 0, 0);
  directionalLight(color(0, 0, 100), -1, 0, 0);

  // orbitControl();
  
  rotateX(-25*sin(frameCount/3));
  rotateY(frameCount / 3);

  push();
  rotate((int(random(4)) * 360) / 4);
  translate(-width / 2, -height / 2, 0);
  let offset = width / 10;
  let x, y, w, h;
  x = offset;
  y = offset;
  w = width - offset * 2;
  h = height - offset * 2;
  separateGrid(x, y, 0, w, h);
  pop();

  // noLoop();
  
    
  }
}

function separateGrid(x, y, z, w, h) {
	let yArr = [];
	let xArrs = [];
	let ySum = 0;
	let yStep;
	while (ySum < 1) {
	  yStep = random(random(random()));
	  if (ySum + yStep > 1) yStep = 1 - ySum;
	  let xArr = [];
	  let xSum = 0;
	  let xStep;
	  while (xSum < 1) {
		xStep = random(random(random()));
		if (xSum + xStep > 1) xStep = 1 - xSum;
		xArr.push(xStep);
		xSum += xStep;
	  }
	  xArr = shuffle(xArr, true);
	  yArr.push(yStep);
	  xArrs.push(xArr);
	  ySum += yStep;
	}
	yArr = shuffle(yArr, true);
  
	for (let i = 0; i < yArr.length; i++) {
	  let nx = x;
	  let yVal = yArr[i] * h;
	  let xArr = xArrs[i];
	  for (let j = 0; j < xArr.length; j++) {
		let xVal = xArr[j] * w;
		let colors = shuffle(palette.concat());
		let center = createVector(nx + xVal / 2, y + yVal / 2);
		push();
		translate(center.x, center.y, z);
		noStroke();
		let n = 0;
		let eStep = 1 / int(random(2, colors.length));
		if (random() > 0.5) {
		  for (let e = 1; e > 0; e -= eStep) {
			let v = (e+y+x+frameCount/100)%1;
			v = ease.elasticOut(v*v);
			let d = xVal/2;
			let h = yVal;
			push();
			scale(e*v);
			rotateY(45);
			fill(colors[n++ % colors.length]);
			cylinder(d*sqrt(2), h, 4+1, 1, false, false);
			pop();
		  }
		} else {
		  rotateZ(90);
		  for (let e = 1; e > 0; e -= eStep) {
			push();
			scale(e);
			fill(colors[n++ % colors.length]);
			cylinder(
			  (yVal / 2) * sin((xVal * 1) / e + frameCount),
			  ((xVal * 1) / e) * sin((yVal * 1) / e + frameCount),
			  64,
			  1,
			  false,
			  false
			);
			pop();
		  }
		}
		pop();
		nx += xVal;
	  }
	  y += yVal;
	}
  }