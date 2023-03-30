async function preload() {
    await RNBOsetup();
    console.log("p5js preload working");
}

function setup() {
    console.log("p5js setup working");
    createCanvas(400, 400);
    if (isRNBOSetupDone) {
        makeP5jsSliders(device);
        isRNBOSetupDone = false;
      }
    
}

function draw() {
    background(255);
    

    // Check if sliders array has at least two elements
    if (sliders.length >= numberOfDeviceParameters) {
        console.log("Slider 0 value:", sliders[0].value());
        console.log("Slider 1 value:", sliders[1].value());

        let sliderVal = sliders[0].value();
        let sliderVal1 = sliders[1].value();
        ellipse(200, 200, sliderVal * 0.75, sliderVal * 0.75);
        ellipse(200, 200, sliderVal1 * 0.75, sliderVal1 * 0.75);
    }
}