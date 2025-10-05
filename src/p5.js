let coins = [];
let pegs = [];
let slots = [];
let coinBalance = 20;
let score = 0;
let highScore = 0;
let synth;
let pegFlashes = [];
let popupTexts = [];

function setup() {
    createCanvas(500, 550);

    synth = new p5.MonoSynth();

    if(getAudioContext().state !== 'running') {
        userStartAudio();
    }

    highScore = localStorage.getItem('coinCascadeHighScore') || 0;
    updateHighScoreDisplay();
    document.getElementById('coins').textContent = "Coins: " + coinBalance;
    let pegStartY = 40;
    let pegEndY = height - 90;
    let pegRows = 11;
    let pegCols = 13;
    let pegSpacingX = (width - 40) / pegCols;
    let pegSpacingY = (pegEndY - pegStartY) / (pegRows - 1);

    for (let row = 0; row < pegRows; row++) {
        let offsetX = (row%2) * (pegSpacingX/2);
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
            multiplier: rewards[i].multiplier
        });
    }
}

function draw() {
    background(30, 50, 80);

    noStroke();
    for(let i=0; i<pegs.length; i++) {
        let peg = pegs[i];

        let flashIndex = pegFlashes.findIndex(flash => flash.pegIndex === i);
        if(flashIndex !== -1) {
            let flash = pegFlashes[flashIndex];
            let flashIntensity = 255 * (flash.duration / 10); 
            fill(255, 255, flashIntensity);
            
            flash.duration--;
            if (flash.duration <= 0) {
                pegFlashes.splice(flashIndex, 1);
            }
        } else {
            fill(255);
        }

        circle(peg.x, peg.y, 10);
    }

    textAlign(CENTER, CENTER);
    textSize(14);
    for (let slot of slots) {
        if (slot.multiplier === 0) {
            fill(100, 50, 50); 
        } else if (slot.multiplier <= 2) {
            fill(50, 100, 50); 
        } else if (slot.multiplier <= 3) {
            fill(100, 100, 50);
        } else {
            fill(150, 100, 50);
        }

        rect(slot.x, slot.y, slot.width, slot.height);

        fill(255);
        let displayText = slot.multiplier + "x";
        text(displayText, slot.x + slot.width/2, slot.y + slot.height/2);
    }

    for(let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        let gravity = createVector(0, 0.3);
        coin.velocity.add(gravity);

        coin.position.add(coin.velocity);

        for (let j = 0; j < pegs.length; j++) {
            let peg = pegs[j];
            let distance = p5.Vector.dist(coin.position, peg);

            if (distance < 12.5) {
                let collisionNormal = p5.Vector.sub(coin.position, peg);
                collisionNormal.normalize();

                let overlap = 12.5 - distance;
                coin.position.add(p5.Vector.mult(collisionNormal, overlap));

                let dotProduct = p5.Vector.dot(coin.velocity, collisionNormal);
                let reflection = p5.Vector.mult(collisionNormal, 2 * dotProduct);
                coin.velocity.sub(reflection);
                coin.velocity.mult(0.8);

                let minFreq = 200;
                let maxFreq = 800;
                let frequency = map(peg.x, 0, width, minFreq, maxFreq);

                try {
                    if (synth && getAudioContext().state === 'running') {
                        synth.play(frequency, 0.2, 0, 0.15);
                    }
                } catch (error) {
                    console.log("Audio error:", error);
                }

                pegFlashes.push({pegIndex: j, duration: 10});

                break;
            }
        }

        if (coin.position.x < 15) {
            coin.position.x = 15;
            coin.velocity.x *= -0.7;
        } else if (coin.position.x > width - 15) {
            coin.position.x = width - 15;
            coin.velocity.x *= -0.7;
        }

        let coinRemoved = false;
        for (let slot of slots) {
            if (coin.position.x > slot.x &&
                coin.position.x < slot.x + slot.width &&
                coin.position.y > slot.y &&
                coin.position.y < slot.y + slot.height) {
                    
                    let scoreGain = slot.multiplier * 10;
                    score += scoreGain;

                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('coinCascadeHighScore', highScore);
                        updateHighScoreDisplay();
                    }

                    document.getElementById('score').textContent = 'Score:' + score;

                    if (coinBalance <= 0 && coins.length <= 1) {
                        setTimeout(showGameOver, 100);
                    }

                    if (slot.multiplier > 0) {
                        let popupText = "+" + scoreGain + " points!";

                        popupTexts.push({
                            text: popupText,
                            x: slot.x + slot.witdh / 2,
                            y: slot.y - 20,
                            life: 90,
                            maxLife: 90,
                            color: slot.multiplier >= 5 ? [255, 215, 0] : [76, 222, 128]
                        });
                    }

                    try {
                        if (synth && getAudioContext().state === 'running') {
                            synth.play(400, 0.3, 0, 0.2);
                            setTimeout(()=> synth.play(500, 0.2, 0, 0.15), 50);
                            setTimeout(() => synth.play(600, 0.15, 0, 0.1), 100);
                        }
                    } catch (error) {
                        console.log("Reward audio error: ", error);
                    }

                    coins.splice(i, 1);
                    coinRemoved = true;
                    break;
            }
        }

        if (!coinRemoved) {
            fill(255, 215, 0);
            stroke(255, 235, 100);
            strokeWeight(2);
            circle(coin.position.x, coin.position.y, 15);

            if (coin.position.y > height + 50) {
                coins.splice(i, 1);
            }
        }
    }

    for (let i = popupTexts.length - 1; i >= 0; i--) {
        let popup = popupTexts[i];

        popup.life--;
        popup.y -= 1.5;

        let alpha = map(popup.life, 0, popup.maxLife, 0, 255);
        push();
        textAlign(CENTER, CENTER);
        textSize(16);
        textFont('Arial');
        fill(0, 0, 0, alpha * 0.8);
        noStroke();
        text(popup.text, popup.x + 1, popup.y + 1);
        fill(popup.color[0], popup.color[1], popup.color[2], alpha);
        
        noStroke();
        text(popup.text, popup.x, popup.y);
        pop();
        if (popup.life <= 0) {
            popupTexts.splice(i, 1);
        }
    }
}

function mousePressed() {
    if (getAudioContext().state !== 'running') {
        userStartAudio();
    }

    if (coinBalance > 0 || (coinBalance === 0 && coins.length > 0)) {
        if (coinBalance === 0) {
            return;
        }

        coinBalance--;

        document.getElementById('coins').textContent = "Coins: " + coinBalance;

        let dropY = 15;
        let dropX = constrain(mouseX, 30, width - 30);

        let newCoin = {
            position: createVector(dropX, dropY),
            velocity: createVector(random(-1, 1), 0)
        };

        coins.push(newCoin);
    }
}

function updateHighScoreDisplay() {
    let highScoreElement = document.getElementById('high-score');
    if (highScoreElement) {
        highScoreElement.textContent = "High score: " + highScore;
    }
}

function showGameOver() {
    if(coins.length === 0) {

        document.getElementById('final-score').textContent = score;
        document.getElementById('high-score-display').textContent = highScore;

        document.getElementById('game-over-dialog').style.display = 'flex';
    }
} 

function restartGame() {
    coinBalance = 20;
    score = 0;
    coins = [];
    popupTexts = [];
    pegFlashes = [];

    document.getElementById('score').textContent = "Score: " + score;
    document.getElementById('coins').textContent = "Coins: " + coinBalance;

    document.getElementById('game-over-dialog').style.display = 'none';
}