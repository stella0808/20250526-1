let video;
let facemesh;
let handpose;
let facePredictions = [];
let handPredictions = [];
let circlePos = null;

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, () => {});
  facemesh.on('predict', results => {
    facePredictions = results;
  });

  handpose = ml5.handpose(video, () => {});
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function draw() {
  image(video, 0, 0, width, height);

  if (facePredictions.length > 0) {
    const keypoints = facePredictions[0].scaledMesh;

    // 預設圓圈在鼻子（168）
    let idx = 168;

    // 如果有偵測到手，判斷手勢
    if (handPredictions.length > 0) {
      const gesture = detectGesture(handPredictions[0]);
      if (gesture === 'scissors') idx = 10;    // 額頭
      else if (gesture === 'paper') idx = 33;  // 左眼
      else if (gesture === 'rock') idx = 263;  // 右眼
    }

    const [x, y] = keypoints[idx];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);
  }
}

// 手勢偵測：簡單判斷石頭、剪刀、布
function detectGesture(hand) {
  // 取得每根手指的末端座標
  const tips = [8, 12, 16, 20]; // 食指、中指、無名指、小指
  let up = 0;
  for (let i = 0; i < tips.length; i++) {
    if (hand.landmarks[tips[i]][1] < hand.landmarks[0][1] - 40) up++;
  }
  // 石頭：全部收起
  if (up === 0) return 'rock';
  // 剪刀：食指和中指伸出
  if (up === 2 &&
      hand.landmarks[8][1] < hand.landmarks[0][1] - 40 &&
      hand.landmarks[12][1] < hand.landmarks[0][1] - 40) return 'scissors';
  // 布：全部伸出
  if (up === 4) return 'paper';
  return 'none';
}
