//P5JS Section

//To do - make a for each loop inside of rnbo initialization function.

let device;
let numberOfDeviceParameters;
let myp5;
let sliders = [];
let MySine, MySine2, v1, v2, x, y, r;
let list = [];

function sketch(p) {
    p.setup = function() {
        RNBOsetup('export/patch.simple-sampler-export2.json');
        p.createCanvas(p.windowWidth, p.windowHeight);
    }
  
    p.draw = function() {
      p.background(0, 50);
  
      p.fill(255);
      p.noStroke();
  
      p.translate(p.width / 2, p.height / 2);

      if (sliders.length >= numberOfDeviceParameters) {
        // git pu
    
        let sliderVal = sliders[0].value();
        let sliderVal1 = sliders[1].value();

        let mappedX = p.map(p.mouseX, 0, p.width, device.parameters[0].min, device.parameters[0].max);
        let mappedY = p.map(p.mouseY, 0, p.height, device.parameters[1].min, device.parameters[1].max);

    
        // Update the corresponding parameter values in the RNBO device
        device.parameters[0].value = mappedX
        device.parameters[1].value = mappedY
     
        // Update the slider values
        // sliders[0].value(device.parameters[0].value);
        // sliders[1].value(device.parameters[1].value);
    
        // p.ellipse(p.width/2, p.height/2, sliderVal * .03, sliderVal * .03);
        // p.ellipse(p.width/2, p.height/2, sliderVal1 * .03, sliderVal1 * .03);
        MySine = (p.sin((p.frameCount * (p.mouseX/75)) / 100 - p.PI/2));
      MySine2 = p.sin((p.frameCount * (p.mouseX/75))  / 1000 + p.PI/2);  
  
      v1 = p.map(MySine, -1, 1, 0, p.width / 2 - r / 2);
      v2 = p.map(MySine2, -1, 1, 0, p.width / 2 - r / 2); 
  
      list=[      0,      v1,      -v1,      v2,      -v2,      v1-v2,      -v1-v2,      v1+v2,      -(v1+v2),      v2-v1,      -v2-v1    ];
  
      x = list;
      y = list;
  
      r = p.map(MySine, -1, 1, 1, 10)*2;
  
      for (let j = 0; j < y.length; j++) {
        for (let i = 0; i < x.length; i++) {
          if (i === 0 && j===0) {
            continue;
          }
  
          p.circle(x[i], y[j], r);
        }
      } 
    }
    }
  } 
  
  myp5 = new p5(sketch);

  
async function RNBOsetup(patchFileURL) {
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
        response = await fetch(patchFileURL);
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

    // (Optional) Fetch the dependencies
    let dependencies = [];
    try {
        const dependenciesResponse = await fetch("export/dependencies.json");
        dependencies = await dependenciesResponse.json();

        // Prepend "export" to any file dependenciies
        dependencies = dependencies.map(d => d.file ? Object.assign({}, d, { file: "export/" + d.file }) : d);
    } catch (e) {}

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

     // (Optional) Load the samples
     if (dependencies.length)
     await device.loadDataBufferDependencies(dependencies);

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

//Main.js
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
//Individual RNBO proj files
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
            console.log(parameterMap[index].value, slider.value());
             // update parameter value in RNBO device

          }); 
        sliders.push(slider);
        offset += 30;
    })
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
