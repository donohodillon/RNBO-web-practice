let devices = [];
let numberOfDeviceParameters;
let sliders = [];
let offset = 10;

let f = 0;


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
  
  createCanvas(w=800, w, WEBGL);
	
   fps = 24
   frameRate(fps)
	
   objs = new Obj()
}
 
function draw() {

  //IMPORTANT: Make sure you're checking that the sliders array is full before you use it

  if (sliders.length > 0) {

  devices[0].parameters[0].value = mouseX;
  devices[2].parameters[3].value = mouseY*10;
  
  background(0)
  push()
  objs.draw()
  pop()
  
    
  }
}

class Obj{
 
	constructor(){
		let num = 32
		let space = w*0.8 / (2*num)
		let pat =['#ffffff', '#303030', '#f02080']
		pat = shuffle(pat)

		this.phs = []
		this.ofs = []
		for(let i=0;i<15;i++){
			this.phs.push(random(-1,1)*10)
			this.ofs.push(random(-1,1)*PI/2)
		}
		this.t = 0
		this.z_amp = 3*space
		this.size = space*0.75
		this.obj = []
		for(let i=-num;i<num;i++){
			for(let j=-num;j<num;j++){
				this.obj.push({
					x:i*space, y:j*space,
					ofs:5*PI/num*sqrt(i*i+j*j),
					color:pat[int(sqrt(i*i+j*j)/2)%3]
				})
			}
		}
	}
	
	draw(){
    let mappedValue = map(devices[0].parameters[0].value, devices[0].parameters[0].min, devices[0].parameters[0].max, 0.005, 0.1);
    let mappedValue2 = map(devices[0].parameters[0].value, devices[0].parameters[0].min, devices[2].parameters[2].max, 0.005, 1);
    
		for(let i=0;i<this.obj.length;i++){
			let dz = 0
			for(let k=0;k<this.phs.length;k++){
				dz += sin(this.obj[i].ofs+this.t*this.phs[k]+this.ofs[k]) 
			}
			push()
			fill(this.obj[i].color)
			stroke(0)
			translate(this.obj[i].x, this.obj[i].y,
								this.z_amp*dz)
			box(this.size*mappedValue2)
			pop()
		}
	
		this.t += mappedValue;
	}
}