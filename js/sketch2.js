let device;
let numberOfDeviceParameters;
let sliders = [];

let _aryXYZ = [];
let _tileNum;
let _aryArg = [];
let _noiseStepX;
let _noiseStepY;
let _noiseStepZ;
let _noiseStepT;
let _r;
let _count;
let _aryLight = [];
let _lightNum;
let speedSlider;
let speedFactor = 1; // Declare a variable for the current speed factor
let targetSpeedFactor = 1;
let sliderVal1Factor = 1; // Declare a variable for the current sliderVal1 factor
let targetSliderVal1Factor = 1;


async function setup() {
  await RNBOsetup('export/patch.exportSAW.json');
  makeP5jsSliders(); 

  createCanvas(windowWidth, windowHeight, WEBGL);

  

  speedSlider = createSlider(0.1, 2, 1, 0.01); // Min: 0.1, Max: 2, Initial: 1, Step: 0.01
  speedSlider.position(10, height - 30);

  
  // console.log('Slider Array: ', sliders);
  // console.log('Slider Value: ', sliders[0].value);
  // console.log('Slider Value: ', sliders[0].value());


  frameRate(60); 
  noStroke();  
  colorMode(HSB, 360, 100, 100, 255);
  specularMaterial(100);
  
  _noiseStepX = 0.1;
  _noiseStepY = 0.1;
  _noiseStepZ = 0.1;
  _noiseStepT = 0.015;
  _tileNum = 10; 
  let initArgX = random(100);
  let initArgY = random(100);
  let initArgZ = random(100);
  let maxWidth = width; 
  for (let i = 0; i < _tileNum; i++) {
    _aryXYZ[i] = [];
    _aryArg[i] = [];
    for (let j = 0; j < _tileNum; j++) {
      _aryXYZ[i][j] = [];
      _aryArg[i][j] = [];
      for (let k = 0; k < _tileNum; k++) {
        _aryXYZ[i][j][k] = [
          maxWidth/(_tileNum-1)*i - maxWidth/2,
          maxWidth/(_tileNum-1)*j - maxWidth/2,
          maxWidth/(_tileNum-1)*k - maxWidth/2
        ];
        _aryArg[i][j][k] = [
          initArgX - _noiseStepX*i,
          initArgY - _noiseStepY*j,
          initArgZ - _noiseStepZ*k
        ];
      }
    }
  }

  _lightNum = 4;
  let initH = random(360);
  for (let i = 0; i < _lightNum; i++) { //H, raduis, initAngle, AngleRate, X-Z-tilt
    _aryLight[i] = [(initH + 360/_lightNum*i) % 360, width/2*random(), 2*PI*random(), random(0.01, 0.1), 2*PI*random()];
  }

  _count = random(1000);


}
 
function draw() {

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) {
  background(0);
  targetSliderVal1Factor = sliders[0].value();

// Gradually interpolate the current sliderVal1 factor towards the target sliderVal1 factor
  let sliderInterpolationAmount = 0.05; // Controls the speed of interpolation (0 to 1)
  sliderVal1Factor += (targetSliderVal1Factor - sliderVal1Factor) * sliderInterpolationAmount;

  targetSpeedFactor = speedSlider.value();

  // Gradually interpolate the current speed factor towards the target speed factor
  let interpolationAmount = 0.05; // Controls the speed of interpolation (0 to 1)
  speedFactor += (targetSpeedFactor - speedFactor) * interpolationAmount;

  for (let i = 0; i < _lightNum; i++) {
    pointLight(
      _aryLight[i][0], 100, 100,
      _aryLight[i][1] * cos(_aryLight[i][2] + frameCount * _aryLight[i][3]) * cos(_aryLight[i][4]),
      _aryLight[i][1] * sin(_aryLight[i][2] + frameCount * _aryLight[i][3]),
      _aryLight[i][1] * cos(_aryLight[i][2] + frameCount * _aryLight[i][3]) * sin(_aryLight[i][4])
    );
  }

  for (let i = 0; i < _tileNum; i++) {
    for (let j = 0; j < _tileNum; j++) {
      for (let k = 0; k < _tileNum; k++) {
        _aryArg[i][j][k][0] += _noiseStepT*0,
        _aryArg[i][j][k][1] += _noiseStepT*0,
        _aryArg[i][j][k][2] += _noiseStepT
      }
    }
  }
  
  push();
  rotateX((_count / (200 / speedFactor)) * (sliderVal1Factor)/10*-1); // Multiply by sliderVal
  rotateY((_count / (200 / speedFactor)) * (sliderVal1Factor)/10*-1); // Multiply by sliderVal1
  rotateZ(_count / (150 / speedFactor));
  for (let i = 0; i < _tileNum; i++) {
    for (let j = 0; j < _tileNum; j++) {
      for (let k = 0; k < _tileNum; k++) {
        let noiseVal = 0.5 + sin(4*PI*noise(_aryArg[i][j][k][0], _aryArg[i][j][k][1], _aryArg[i][j][k][2]))/2;
        if (noiseVal > -0.9) {
          push();
          translate(_aryXYZ[i][j][k][0], _aryXYZ[i][j][k][1], _aryXYZ[i][j][k][2]);
          rotateX(12*PI * noise(_aryArg[i][j][k][0], _aryArg[i][j][k][1], _aryArg[i][j][k][2]));
          rotateY(6*PI * noise(_aryArg[i][j][k][0], _aryArg[i][j][k][1], _aryArg[i][j][k][2]));
          rotateZ(3*PI * noise(_aryArg[i][j][k][0], _aryArg[i][j][k][1], _aryArg[i][j][k][2]));
          sphere(_r/2*noiseVal);
          pop();
        }
      }
    }
  }
  pop();

  _count++;

    console.log('Slider Value: ', sliders[0].value());
  }
}


function mouseReleased() {
  _aryXYZ = [];
  _aryArg = [];
  _aryLight = [];

  let initArgX = random(100);
  let initArgY = random(100);
  let initArgZ = random(100);
  let maxWidth = width;
  _r = maxWidth / _tileNum/2;
  for (let i = 0; i < _tileNum; i++) {
    _aryXYZ[i] = [];
    _aryArg[i] = [];
    for (let j = 0; j < _tileNum; j++) {
      _aryXYZ[i][j] = [];
      _aryArg[i][j] = [];
      for (let k = 0; k < _tileNum; k++) {
        _aryXYZ[i][j][k] = [
          maxWidth/(_tileNum-1)*i - maxWidth/2,
          maxWidth/(_tileNum-1)*j - maxWidth/2,
          maxWidth/(_tileNum-1)*k - maxWidth/2
        ];
        _aryArg[i][j][k] = [
          initArgX - _noiseStepX*i,
          initArgY - _noiseStepY*j,
          initArgZ - _noiseStepZ*k
        ];
      }
    }
  }

  _lightNum = 4;
  let initH = random(360);
  for (let i = 0; i < _lightNum; i++) { //H, raduis, initAngle, AngleRate, X-Z-tilt
    _aryLight[i] = [(initH + 360/_lightNum*i) % 360, width/2*random(), 2*PI*random(), random(0.01, 0.1), 2*PI*random()];
  }

  _count = random(1000);
  
}

