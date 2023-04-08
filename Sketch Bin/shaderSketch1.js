let sh, gl;
let vert, frag;

let device;
let numberOfDeviceParameters;
let sliders = [];
let sliderValue;
let sliderValue1;

function preload(){
    vert = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    attribute vec3 aPosition;
    varying vec2 vTexCoord;
    uniform vec2 u_resolution;
    void main() {
        vec2 aspect = vec2(u_resolution.y / u_resolution.x, 1);
        gl_Position = vec4(aPosition.xy * aspect, aPosition.z, 1.0);
        vTexCoord = (gl_Position.xy + 1.0) / 2.0;
    }
`;



    frag = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        #define RADIANS 0.017453292519943295

        const int zoom = 40;
        const float brightness = 0.975;
        float fScale = 1.25;
        varying vec2 vTexCoord;

        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;

        float cosRange(float degrees, float range, float minimum) {
            return (((1.0 + cos(degrees * RADIANS)) * 0.5) * range) + minimum;
        }

        void main() {
            float time = u_time * 1.25;
            vec2 uv = vTexCoord;
            vec2 p  = (2.0*vTexCoord*u_resolution-u_resolution)/max(u_resolution.x,u_resolution.y);
            float ct = cosRange(time*5.0, 3.0, 1.1);
            float xBoost = cosRange(time*0.2, 5.0, 5.0);
            float yBoost = cosRange(time*0.1, 10.0, 5.0);

            fScale = cosRange(time * 15.5, 1.25, 0.5);

            for(int i=1;i<zoom;i++) {
                float _i = float(i);
                vec2 newp=p;
                newp.x+=0.25/_i*sin(_i*p.y+time*cos(ct)*0.5/20.0+0.005*_i)*fScale+xBoost;     
                newp.y+=0.25/_i*sin(_i*p.x+time*ct*0.3/40.0+0.03*float(i+15))*fScale+yBoost;
                p=newp;
            }

            vec3 col=vec3(0.5*sin(3.0*p.x)+0.5,0.5*sin(3.0*p.y)+0.5,sin(p.x+p.y));
            col *= brightness;

            // Add border
            float vigAmt = 5.0;
            float vignette = (1.-vigAmt*(uv.y-.5)*(uv.y-.5))*(1.-vigAmt*(uv.x-.5)*(uv.x-.5));
            float extrusion = (col.x + col.y + col.z) / 4.0;
            extrusion *= 1.5;
            extrusion *= vignette;

            gl_FragColor = vec4(col, extrusion);
        }
    `;
}

async function setup() {
    await RNBOsetup('export/patch.exportSAW.json');
    makeP5jsSliders(); 

    createCanvas(1112, 834, WEBGL);
    noStroke();

    gl = this.canvas.getContext('webgl');
    gl.disable(gl.DEPTH_TEST);

    sh = createShader(vert,frag);
}

function draw() {
    // if (sliders.length > 0) {
        sliderValue = sliders[0].value();
        sliderValue1 = sliders[1].value();

        

        // shader() sets the active shader with our shader 
        shader(sh);
		sh.setUniform("u_resolution", [width, height]);
        sh.setUniform("u_time", millis() / sliderValue * sliderValue1);
        sh.setUniform("u_mouse", [mouseX, map(mouseY, 0, height, height, 0)]);

        // something for the shader to draw on
        ellipse(-width / 2 + width / 2, -height / 2 + height / 2, width, height);

    }
// }


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}


// save jpg
let lapse = 0; // mouse timer 
