// Variables from Tone.js

let synth; 
let delay; 
let reverb; 
let waveform; 

// Global p5.js variables

let fireflies = []; // This creates an empty list, there are no fireflies in it yet. Each time the user clicks, we will add a new firefly object to this list. Each firefly will have properties like position, size, color, and life span that we can use to draw and animate it on the canvas.

// Variable to hold background
 
let bgImage;

// Preload background 

function preload() {
  bgImage = loadImage('cozygarden.PNG');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();

// Audio SetUp

// 1. Synthesis. Use of PolySynth allows multiple notes to overlap and ring out at the same time. "Sine" wave for a soft clear tone. 

synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sine" },
  envelope: {attack: 0.01, decay: 0.5, sustain: 0.1, release: 2 }
});

// 2. Audio Effects: Delay and Reverb 
delay = new Tone.FeedbackDelay("8n", 0.4);
reverb = new Tone.Reverb({ decay: 4, wet: 0.8});

// 3. Audio Analysis. Audio pipeline and sending sound to the computer speakers
waveform = new Tone.Waveform(1024);

synth.chain(delay, reverb, Tone.Destination);
reverb.connect(waveform);

Tone.Destination.volume.value = -10;
}

// Background
function draw() {
  image(bgImage, 0, 0, width, height);

// Read the current audio data
  let buffer = waveform.getValue();
  let peak = 0;
  
  // Find the loudest peak in the current audio frame
  for (let i = 0; i < buffer.length; i++) {
    let val = Math.abs(buffer[i]);
    if (val > peak) peak = val;
  }

  // Update and draw our firefly particles
  for (let i = fireflies.length - 1; i >= 0; i--) {
    let f = fireflies[i];
    f.life -= 0.005; // Slowly fade out over time

    // Remove dead fireflies from the array to save memory
    if (f.life <= 0) {
      fireflies.splice(i, 1);
    } else {
      // 4. Audio-Reactive Visuals: The firefly radius expands based on the audio peak!
      let reactiveSize = f.size + (peak * 150 * f.life);
      
      // Draw outer glow
      fill(f.hue, 80, 100, f.life);
      circle(f.x, f.y, reactiveSize);
      
      // Draw inner bright core
      fill(f.hue, 20, 100, f.life + 0.2);
      circle(f.x, f.y, reactiveSize * 0.4);
      
      // Gentle floating animation
      f.y -= 0.5; // Float up
      f.x += sin(frameCount * 0.05 + f.x) * 0.5; // Wiggle side to side
    }
  }
}

// 5. User Interaction 
async function mousePressed(){
  // Start audio engine
  if (Tone.context.state !=="running") {
    await Tone.start();
  }
  
  const notes = ["C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4"];
  
  // Map the mouse's Y position to a note in the scale (higher on screen = higher pitch)
  let noteIndex = floor(map(mouseY, height, 0, 0, notes.length - 1));
  noteIndex = constrain(noteIndex, 0, notes.length - 1);
  let note = notes[noteIndex];
  
  // Map the mouse's X position to a color hue (spanning cool blues to warm yellows)
  let hueVal = map(mouseX, 0, width, 220, 50); 

  // Trigger the synth note
  synth.triggerAttackRelease(note, "8n");

  // Spawn a new firefly particle where the user clicked
  fireflies.push({
    x: mouseX,
    y: mouseY,
    size: random(15, 25),
    hue: hueVal,
    life: 1.0 // Start at full opacity
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}