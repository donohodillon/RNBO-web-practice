//P5JS Section

//To do - make a for each loop inside of rnbo initialization function.

let device;
let numberOfDeviceParameters;
let myp5;
let sliders = [];

let sketch = function(p) {

    console.log("p5js library loaded") 

    p.setup = async function() {
        await RNBOsetup();   
        console.log("p5js setup working")
        p.createCanvas(400, 400);
    } 
    
    p.draw = function() {
        p.background(255);
    
        // Check if sliders array has at least two elements
        if (sliders.length >= numberOfDeviceParameters) {
            console.log("Slider 0 value:", sliders[0].value());
            console.log("Slider 1 value:", sliders[1].value());
    
            let sliderVal = sliders[0].value();
            let sliderVal1 = sliders[1].value();
            p.ellipse(200, 200, sliderVal * .75, sliderVal * .75);
            p.ellipse(200, 200, sliderVal1 * .75, sliderVal1 * .75);
        }
    }
     
  }

myp5 = new p5(sketch);

// let sketch = function(p) {
//     let angle = 0;
//     let scalar = 0.01;
//     let speed = 0.01;
    
//     p.setup = function() {
//       RNBOsetup();
//       p.createCanvas(700, 700);
//       p.background(10);
//     }
    
//     p.draw = function() {
//       p.background(255);
//       let sliderVal = sliders[0].value();
//       let sliderVal1 = sliders[1].value();
//       for (let i = 0; i < 900; i++) {
//         let x = p.width/2 + (scalar + i * 9) * p.cos(angle + i * 9);
//         let y = p.height/2 + (scalar + i * 9) * p.sin(angle + i * 9);
//         p.stroke(0);
//         p.fill(0, 128, 128);
//         p.ellipse(x, y, 50, 50);
//       }
//       angle += speed*(sliderVal/3);
//       scalar += p.sin(angle);
//     } 
//   } 
   
//   myp5 = new p5(sketch);
  


 
//RNBO SECTION
async function RNBOsetup() {
    const patchExportURL = "export/patch.exportSAW.json";
    console.log("RNBO setup working")

    // Create AudioContext
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();
    if (context != null){
        console.log("Audio Context Created");
    }

    // Create gain node and connect it to audio output
    const outputNode = context.createGain();
    outputNode.connect(context.destination);  

  
    // Fetch the exported patcher
    let response, patcher;
    try { 
        response = await fetch(patchExportURL);
        patcher = await response.json();
    
        if (!window.RNBO) {
            // Load RNBO script dynamically
            // Note that you can skip this by knowing the RNBO version of your patch
            // beforehand and just include it using a <script> tag
            await loadRNBOScript(patcher.desc.meta.rnboversion);
        }

    } catch (err) {
        const errorContext = {
            error: err
        };
        if (response && (response.status >= 300 || response.status < 200)) {
            errorContext.header = `Couldn't load patcher export bundle`,
            errorContext.description = `Check app.js to see what file it's trying to load. Currently it's` +
            ` trying to load "${patchExportURL}". If that doesn't` + 
            ` match the name of the file you exported from RNBO, modify` + 
            ` patchExportURL in app.js.`;
        }
        if (typeof guardrails === "function") {
            guardrails(errorContext);
        } else {
            throw err;
        }
        return;
    }
    // Create the device
    try {
        device = await RNBO.createDevice({ context, patcher });
    } catch (err) {
        if (typeof guardrails === "function") {
            guardrails({ error: err });
        } else {
            throw err;
        }
        return;
    }

    // Connect the device to the web audio graph
    device.node.connect(outputNode);

    

    document.body.onclick = () => {
        context.resume();
    }

      // Creates stop playback button with spacebar

      let isVolumeOn = true;

      window.addEventListener('keydown', event => {
          if (event.code === 'Space') {
            // toggle volume on/off
            isVolumeOn = !isVolumeOn;
            console.log("keydown event");
            
            // set gain value with linear ramp
            const currentGain = outputNode.gain.value;
            const targetGain = isVolumeOn ? 1 : 0;
            const rampDuration = 0.1; // adjust as needed
            outputNode.gain.cancelScheduledValues(context.currentTime);
            outputNode.gain.setValueAtTime(currentGain, context.currentTime);
            outputNode.gain.linearRampToValueAtTime(targetGain, context.currentTime + rampDuration);
          }
        });  

    numberOfDeviceParameters = device.parameters.length;

    // Skip if you're not using guardrails.js
    if (typeof guardrails === "function")
        guardrails();

    makeP5jsSliders(myp5,device);

    device.parameters.forEach(param => {
        console.log("Param Id: ", param.id)
        console.log("Param Name: ", param.name)
        console.log("Param Min: ", param.min)
        console.log("Param Max: ", param.max) 
    })

}

function loadRNBOScript(version) {
    return new Promise((resolve, reject) => {
        if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
            throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
        }
        const el = document.createElement("script");
        el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
        el.onload = resolve;
        el.onerror = function(err) {
            console.log(err);
            reject(new Error("Failed to load rnbo.js v" + version));
        };
        document.body.append(el);
    });
}

function makeP5jsSliders(myp5, device) {
    let offset = 0;
    console.log("p5jsslidersfunction")
    device.parameters.forEach((param, index)=>{
        let slider = myp5.createSlider(param.min, param.max, param.min);
        console.log("slider created")
        slider.position(10, 10 + offset);
        slider.input(() => {
            let parameterMap = device.parameters;
            parameterMap[index].value = slider.value();
            // console.log(parameterMap[index].value, slider.value());

          }); 
        sliders.push(slider);
        offset += 30;
    })
}

function makeSliders(device) {
    // let pdiv = document.getElementById("rnbo-parameter-sliders");
    // let noParamLabel = document.getElementById("no-param-label");
    // if (noParamLabel && device.numParameters > 0) pdiv.removeChild(noParamLabel);
    console.log("Make sliders function called")

    // This will allow us to ignore parameter update events while dragging the slider.
    let isDraggingSlider = false;
    let uiElements = {};

    device.parameters.forEach(param => {
        // Subpatchers also have params. If we want to expose top-level
        // params only, the best way to determine if a parameter is top level
        // or not is to exclude parameters with a '/' in them.
        // You can uncomment the following line if you don't want to include subpatcher params
        
        //if (param.id.includes("/")) return;

        // Create a label, an input slider and a value display
        let label = document.createElement("label");
        let slider = document.createElement("input");
        let text = document.createElement("input"); 
        let sliderContainer = document.createElement("div");
        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(text);

        // Add a name for the label
        label.setAttribute("name", param.name);
        label.setAttribute("for", param.name);
        label.setAttribute("class", "param-label");
        label.textContent = `${param.name}: `;

        // Make each slider reflect its parameter
        slider.setAttribute("type", "range");
        slider.setAttribute("class", "param-slider");
        slider.setAttribute("id", param.id);
        slider.setAttribute("name", param.name);
        slider.setAttribute("min", param.min);
        slider.setAttribute("max", param.max);

        //Console messages 
        

        //Set step attributes
        if (param.steps > 1) {
            slider.setAttribute("step", (param.max - param.min) / (param.steps - 1));
        } else {
            slider.setAttribute("step", (param.max - param.min) / 1000.0);
        }
        slider.setAttribute("value", param.value);

        // Make a settable text input display for the value
        text.setAttribute("value", param.value.toFixed(1));
        text.setAttribute("type", "text");

        // Make each slider control its parameter
        slider.addEventListener("pointerdown", () => {
            isDraggingSlider = true;
        });
        slider.addEventListener("pointerup", () => {
            isDraggingSlider = false;
            slider.value = param.value;
            text.value = param.value.toFixed(1);
            console.log(param.name, ":", slider.value);
        });
        slider.addEventListener("input", () => {
            let value = Number.parseFloat(slider.value);
            param.value = value;
        });

        // Make the text box input control the parameter value as well
        text.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
                let newValue = Number.parseFloat(text.value);
                if (isNaN(newValue)) {
                    text.value = param.value;
                } else {
                    newValue = Math.min(newValue, param.max);
                    newValue = Math.max(newValue, param.min);
                    text.value = newValue;
                    param.value = newValue;
                }
            }
        });

        // Store the slider and text by name so we can access them later
        uiElements[param.id] = { slider, text };

        // Add the slider element
        pdiv.appendChild(sliderContainer);
      
    });

    // Listen to parameter changes from the device
    device.parameterChangeEvent.subscribe(param => {
        if (!isDraggingSlider)
            uiElements[param.id].slider.value = param.value;
        uiElements[param.id].text.value = param.value.toFixed(1);
    });
}

function makeInportForm(device) {
    const idiv = document.getElementById("rnbo-inports");
    const inportSelect = document.getElementById("inport-select");
    const inportText = document.getElementById("inport-text");
    const inportForm = document.getElementById("inport-form");
    let inportTag = null;
    
    // Device messages correspond to inlets/outlets or inports/outports
    // You can filter for one or the other using the "type" of the message
    const messages = device.messages;
    const inports = messages.filter(message => message.type === RNBO.MessagePortType.Inport);

    if (inports.length === 0) {
        idiv.removeChild(document.getElementById("inport-form"));
        return;
    } else {
        idiv.removeChild(document.getElementById("no-inports-label"));
        inports.forEach(inport => {
            const option = document.createElement("option");
            option.innerText = inport.tag;
            inportSelect.appendChild(option);
        });
        inportSelect.onchange = () => inportTag = inportSelect.value;
        inportTag = inportSelect.value;

        inportForm.onsubmit = (ev) => {
            // Do this or else the page will reload
            ev.preventDefault();

            // Turn the text into a list of numbers (RNBO messages must be numbers, not text)
            const values = inportText.value.split(/\s+/).map(s => parseFloat(s));
            
            // Send the message event to the RNBO device
            let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inportTag, values);
            device.scheduleEvent(messageEvent);
        }
    }
}

function attachOutports(device) {
    const outports = device.outports;
    if (outports.length < 1) {
        document.getElementById("rnbo-console").removeChild(document.getElementById("rnbo-console-div"));
        return;
    }

    document.getElementById("rnbo-console").removeChild(document.getElementById("no-outports-label"));
    device.messageEvent.subscribe((ev) => {

        // Ignore message events that don't belong to an outport
        if (outports.findIndex(elt => elt.tag === ev.tag) < 0) return;

        // Message events have a tag as well as a payload
        console.log(`${ev.tag}: ${ev.payload}`);

        document.getElementById("rnbo-console-readout").innerText = `${ev.tag}: ${ev.payload}`;
    });
}

function loadPresets(device, patcher) {
    let presets = patcher.presets || [];
    if (presets.length < 1) {
        document.getElementById("rnbo-presets").removeChild(document.getElementById("preset-select"));
        return;
    }

    document.getElementById("rnbo-presets").removeChild(document.getElementById("no-presets-label"));
    let presetSelect = document.getElementById("preset-select");
    presets.forEach((preset, index) => {
        const option = document.createElement("option");
        option.innerText = preset.name;
        option.value = index;
        presetSelect.appendChild(option);
    });
    presetSelect.onchange = () => device.setPreset(presets[presetSelect.value].preset);
}

function makeMIDIKeyboard(device) {
    let mdiv = document.getElementById("rnbo-clickable-keyboard");
    if (device.numMIDIInputPorts === 0) return;

    mdiv.removeChild(document.getElementById("no-midi-label"));

    const midiNotes = [49, 52, 56, 63];
    midiNotes.forEach(note => {
        const key = document.createElement("div");
        const label = document.createElement("p");
        label.textContent = note;
        key.appendChild(label);
        key.addEventListener("pointerdown", () => {
            let midiChannel = 0;

            // Format a MIDI message paylaod, this constructs a MIDI on event
            let noteOnMessage = [
                144 + midiChannel, // Code for a note on: 10010000 & midi channel (0-15)
                note, // MIDI Note
                100 // MIDI Velocity
            ];
        
            let noteOffMessage = [
                128 + midiChannel, // Code for a note off: 10000000 & midi channel (0-15)
                note, // MIDI Note
                0 // MIDI Velocity
            ];
        
            // Including rnbo.min.js (or the unminified rnbo.js) will add the RNBO object
            // to the global namespace. This includes the TimeNow constant as well as
            // the MIDIEvent constructor.
            let midiPort = 0;
            let noteDurationMs = 250;
        
            // When scheduling an event to occur in the future, use the current audio context time
            // multiplied by 1000 (converting seconds to milliseconds) for now.
            let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, midiPort, noteOnMessage);
            let noteOffEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000 + noteDurationMs, midiPort, noteOffMessage);
        
            device.scheduleEvent(noteOnEvent);
            device.scheduleEvent(noteOffEvent);

            key.classList.add("clicked");
        });

        key.addEventListener("pointerup", () => key.classList.remove("clicked"));

        mdiv.appendChild(key);
    });
}
