let ropeX;
let ropeY;
let dragging = false;
let ropeLength = 240;
let targetLength = 240;

let drop = null;
let ripples = [];

let letters = [];
let waterLevel;
let dropTargetY;
let margin;

let poem = `I almost hate most parts of this world. Sometimes I can’t tell dreams from reality, and I can’t quite explain my emotions. So I keep finding things that can hurt a little, just to feel something. I used to think worldly success would make me happy. I buried myself in tight study schedules, trying to lower the threshold for happiness. But that kind of joy was always so brief, so brief that achievements started to feel merely expected.
And then you appeared. And then I fell in love with you.
My emotions hadn’t fluctuated that wildly in a long time. I realized I didn’t need high scores or a lot of money to feel joyful every day. The feelings I had spent so long chasing — you could give them to me with a single hug. So this is what it feels like to be cared for. So this is what it feels like to be missed. How can people hug each other every single day? Why me? How am I worthy of your love?
I accept your care cautiously, and cautiously test how bold I’m allowed to be. You hold my hand without saying anything, watching me fold your fingers one by one and open them again. You bury your head against my chest, and suddenly my heart feels like waves crashing inside me. When you kiss my cheek somewhere dark, my ears turn red enough to cosplay the sun.
I still have so many serious things to do this month — preparing for exams, working on my portfolio, taking tests in June, sending résumés, internships. I’m scared. Scared of the unknown, and of all the things that slip through my fingers no matter how hard I try to hold on to them.
And then I think of your face.
In your bright eyes, I can see myself reflected there. Suddenly, everything feels a little less frightening. You’re already beside me — what else is there to fear? All that’s left is to quietly prepare for each thing ahead of me, and then come to you afterward for praise and hugs.`;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  ropeX = width / 2;
  ropeY = height * 0.2;
textFont("Georgia");
  margin = 20;
  createLetters();
}

/* ================= ROPE ================= */

function draw() {
  background(255);

  if (dragging) {
    ropeX = lerp(ropeX, mouseX, 0.1);
    ropeY = lerp(ropeY, mouseY, 0.1);
  }

  ropeLength = lerp(ropeLength, targetLength, 0.12);

  drawRope();
  updateDrop();
  updateRipples();
  drawLetters();
}


function drawRope() {

  let leftX = ropeX - ropeLength / 2;
  let rightX = ropeX + ropeLength / 2;

  let ropeThickness = map(ropeLength, 240, 280, 14, 9);

  /* ================= 主绳子 ================= */

  stroke(150, 130, 110);
  strokeWeight(ropeThickness);
  noFill();

  for (let x = leftX; x < rightX; x += 8) {

    let y1 = ropeY + sin(x * 0.03) * 6;
    let y2 = ropeY + sin((x + 8) * 0.03) * 6;

    line(x, y1, x + 8, y2);
  }

  /* ================= 麻花纹理 ================= */

  stroke(110, 90, 70);
  strokeWeight(ropeThickness * 0.16);

  let twistGap = map(ropeLength, 240, 280, 14, 20);

  for (let x = leftX; x < rightX; x += twistGap) {

    let y = ropeY + sin(x * 0.03) * 6;
    let twistSize = ropeThickness * 0.3;

    line(
      x - twistSize,
      y - twistSize,
      x + twistSize,
      y + twistSize
    );
  }

  /* ================= 高光 ================= */

  stroke(220, 200, 180, 120);
  strokeWeight(ropeThickness * 0.22);

  for (let x = leftX; x < rightX; x += 8) {

    let y1 = ropeY - 2 + sin(x * 0.03) * 6;
    let y2 = ropeY - 2 + sin((x + 8) * 0.03) * 6;

    line(x, y1, x + 8, y2);
  }
}

/* ================= MOUSE ================= */

function mousePressed() {
  let hitRope = false;

  let leftX = ropeX - ropeLength / 2;
  let rightX = ropeX + ropeLength / 2;

  for (let x = leftX; x < rightX; x += 8) {

    let y = ropeY + sin(x * 0.03) * 6;

    let d = dist(mouseX, mouseY, x, y);

    if (d < 12) {   // 🌿 绳子“粗细判定半径”
      hitRope = true;
      break;
  }
}

  if (hitRope) {
    dragging = true;
    targetLength = 280;

    drop = { x: mouseX, y: mouseY, speedY: 0 };

    dropTargetY = constrain(
      ropeY + random(180, 420),
      80,
      height - 60
    );
  }

  if (mouseY < height * 0.45 && !hitRope) {
    ripples.push({
      x: mouseX,
      y: mouseY,
      size: 10,
      alpha: 120
    });
  }
}

function mouseReleased() {
  dragging = false;
  targetLength = 240;
}

/* ================= DROP（水滴生成文字核心触发） ================= */

function updateDrop() {
  if (!drop) return;

  drop.speedY += 0.2;
  drop.y += drop.speedY;

  noStroke();
  fill(80, 140, 255);
  ellipse(drop.x, drop.y, 14, 18);

  if (drop.y > dropTargetY) {
    ripples.push({
      x: drop.x,
      y: drop.y,
      size: random(5, 20),
      alpha: 120
    });

    drop = null;
  }
}

/* ================= RIPPLE（唤醒文字） ================= */

function updateRipples() {
  for (let r of ripples) {

    noFill();
    stroke(100, 160, 255, r.alpha);
    strokeWeight(2);
    ellipse(r.x, r.y, r.size);

    for (let l of letters) {

      let d = dist(l.x, l.y, r.x, r.y);

      if (d < r.size / 2 + 10 && l.state === "hidden") {
        l.state = "visible";
        l.alpha = 255;
      }
    }

    r.size += 2;
    r.alpha -= 2;
  }

  ripples = ripples.filter(r => r.alpha > 0);
}

/* ================= LETTERS ================= */

function createLetters() {
  letters = [];

  let index = 0;
  let spacingX = 18;
  let spacingY = 30;

  for (let y = 40; y < height - margin; y += spacingY) {
    for (let x = margin; x < width - margin; x += spacingX) {

      if (index >= poem.length) index = 0;

      letters.push({
        char: poem[index],
        x: x,
        y: y,
        alpha: 0,
        state: "hidden",
        sinkOffset: random(1000),
        vy: 0,
        fallDelay: random(0, 300),
        fallStart:0
      });

      index++;
    }
  }
}

/* ================= DRAW LETTERS（核心逻辑） ================= */

function drawLetters() {
  textSize(16);
  noStroke();

  let allGenerated = letters.every(l => l.state !== "hidden");

  for (let l of letters) {

    // 🌙 1. 出现
    if (l.state === "visible") {
      l.alpha += 8;
      l.alpha = min(l.alpha, 255);
    }

    // 🌊 2. 全部生成后进入坍塌
    if (allGenerated && l.state === "visible") {
  if (!l.fallStart) {
    l.fallStart = frameCount + l.fallDelay;
  }
}

    // 🌙 3. 坍塌
      if (l.fallStart && frameCount > l.fallStart) {

        l.state = "falling";

        l.vy += 0.12;
        l.y += l.vy;

        l.alpha -= 0.5;
        l.alpha = max(l.alpha, 0);
      }

    // 🌊 水波残影（轻微生命感）
    let waveY = sin(frameCount * 0.02 + l.sinkOffset) * 1.5;

    fill(120, 170, 255, l.alpha);
    text(l.char, l.x, l.y + waveY);
  }
}
