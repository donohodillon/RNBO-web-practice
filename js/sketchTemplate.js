let devices = [];
let numberOfDeviceParameters;
let sliders = [];
let offset = 10;

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
  
  createCanvas(windowWidth, windowHeight);
}
 
function draw() {

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) {

  devices[0].parameters[0].value = mouseX;
  devices[2].parameters[3].value = mouseY*10;
  
  background(255);
  ellipse(windowWidth/2,windowHeight/2,devices[0].parameters[0].value,devices[0].parameters[0].value)
    
  }
}
 