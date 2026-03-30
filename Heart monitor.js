// Audio variables 

let synth;
let hasBeeped = false;

// Visual variabes 

let x = 0;
let prevX = 0;
let prevY = 300; 
let t = 0;

function setup() {
  createCanvas(800, 400); 
  background(10);
  
  synth = new Tone.Synth().toDestination();
  
  // User instructions
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text("CLICK CANVAS TO START AUDIO", width/2, height/2);
}

function draw() {
  
  if (Tone.context.state !== 'running') return;
  
  background(10, 15);
  drawGrid();
  
  let heartbeatArea = sin(frameCount * 0.05);
  let noiseLevel;
  
  if (heartbeatArea > 0.8) {
    // Peak
    noiseLevel = noise(t) * 150; 
    
    if (!hasBeeped) {
      synth.triggerAttackRelease("C8", "16n");
      hasBeeped = true; 
    }
    
  } else {
    noiseLevel = noise(t) * 10;
    hasBeeped = false; 
  }
  
  let y = 200 - noiseLevel;
  
  stroke(50, 255, 50); // Neon Green
  strokeWeight(2);
  line(prevX, prevY, x, y);
  
  prevX = x;
  prevY = y;
  x += 4; 
  t += 0.2;
  
  if (x > width) {
    x = 0;
    prevX = 0;
    background(10); 
  }
}
function drawGrid() {
  stroke(20, 80, 20); 
  strokeWeight(1);
  // Draw vertical lines
  for (let i = 0; i < width; i += 40) {
    line(i, 0, i, height);
  }
  // Draw horizontal lines
  for (let i = 0; i < height; i += 40) {
    line(0, i, width, i);
  }
}

function mousePressed() {
  if (Tone.context.state !== 'running') {
    Tone.start();
    background(10);
  }
}