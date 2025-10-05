let coins = [];
let pegs = [];
let slots = [];
let coinBalance = [];
let score = [];
let highScore = [];
let synth;

function setup() {
    createCanvas(500, 550);

    snyth = new p5.MonoSynth();

    if(getAudioContext().state !== 'running') {
        userStartAudio();
    }

    highScore = localStorage.getItem('coinCascadeHighScore') || 0;
    updateHighScoreDisplay();

    let pegStartY = 40;
    let pegEndY = height - 90;
    let pegRows = 11;
    let pegCols = 13;
    let pegSpacingX = (width - 40) / pegCols;
    let pegSpacingY = (pegEndY - pegStartY) / (pegRows - 1);

    for (let row = 0; row < pegRows; row++) {
        let offSetX = (row%2) * (pegSpacingX/2);
        let startX = 30 + offsetX;

        let maxPegs = row%2 === 0 ? pegCols: pegCols-1;

        for (let col = 0; col < maxPegs; col++) {
            let x = startX + col * pegSpacingX;
            let y = pegStartY + row * pegSpacingY;

            if (x >= 25 && x<= width -25) {
                pegs.push(createVector(x, y));
            }
        }
    }

    let slotWidth = 65;
    let slotHeight = 50;
    let numOfSlots = 7;
    let slotSpacing = (width - (numOfSlots * slotWidth)) / (numOfSlots + 1);

    let rewards = [
        {multiplier: 0},
        {multiplier: 2},
        {multiplier: 3},
        {multiplier: 5},
        {multiplier: 3},
        {multiplier: 2},
        {multiplier: 0},        
    ];

    for (let i = 0; i < numOfSlots; i++) {
        let x = slotSpacing + i * (slotWidth + slotSpacing);
        let y = height - slotHeight - 10;

        slots.push({
            x: x,
            y: y,
            width: slotWidth,
            height: slotHeight,
            multiplier: rewards[i].multiplier,
        })
    }
}

function draw() {
    
}