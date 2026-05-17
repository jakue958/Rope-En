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

let poem = `我几乎讨厌这世界的大部分。我有时候分不清梦境和现实，我以为只要我获得了世俗的成功就会快乐，便把自己放在紧张的备考日程里，为了降低我感到快乐的阈值。可是那样的喜悦相当短暂。然后你出现了，然后我爱上你。心情很久不那样大幅地波动了。原来不需要考高分赚大钱也可以每天都那样喜悦，原来我努力很久想要得到的情绪你给我一个拥抱就可以了。原来被人关心是这种感觉，被惦记是这种感觉。人怎么可以每天都抱抱呢。我为什么，我何德何能获得你的爱呢。我小心翼翼地接受你的关怀，小心翼翼地试探我可以大胆到什么程度。你握住我的手，你也没说话，看着我把你的手指一根根折起来又摊开。你把脑袋埋在我胸前，我心里就一阵波涛翻涌。你在黑暗的地方亲吻我的脸颊，我就觉得耳朵红得可以cos太阳。我这个月要做的事很多啊，备考，准备就业作品集，六月份要考试，投简历，见习。我很害怕，害怕未知的一切和那些伸手抓不住的东西。这时候我抬头想起你的脸，你明媚的眼睛里映出一个我。突然觉得也没那么可怕。你已经在我身边了，我还有什么可畏惧的？剩下的就是安心准备每件事情，最后找你要夸奖和抱抱。`;

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
