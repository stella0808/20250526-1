let video;
let facemesh;
let handpose;
let facePredictions = [];
let handPredictions = [];
let circlePos = null;
let img1, img2, img3; // 新增變數儲存圖片

function preload() {
  img1 = loadImage('1.png'); // 剪刀
  img2 = loadImage('2.png'); // 石頭
  img3 = loadImage('3.png'); // 布
}

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

    // 取得臉部外框的幾個關鍵點
    const left = keypoints[234];
    const right = keypoints[454];
    const top = keypoints[10];
    const bottom = keypoints[152];

    // 臉部中心與寬高
    const faceCenterX = (left[0] + right[0]) / 2;
    const faceCenterY = (top[1] + bottom[1]) / 2;
    const faceWidth = dist(left[0], left[1], right[0], right[1]);
    const faceHeight = dist(top[0], top[1], bottom[0], bottom[1]);

    let showImg = false;
    let imgToShow = null;

    // 如果有偵測到手，判斷手勢
    if (handPredictions.length > 0) {
      const gesture = detectGesture(handPredictions[0]);
      if (gesture === 'scissors') {
        showImg = true;
        imgToShow = img1;
      } else if (gesture === 'paper') {
        showImg = true;
        imgToShow = img3;
      } else if (gesture === 'rock') {
        showImg = true;
        imgToShow = img2;
      }
    }

    if (showImg && imgToShow) {
      imageMode(CENTER);
      image(imgToShow, faceCenterX, faceCenterY, faceWidth * 1.2, faceHeight * 1.2); // 套用到整臉
      imageMode(CORNER);
    } else {
      // 預設圓圈在鼻子（168）
      const [x, y] = keypoints[168];
      noFill();
      stroke(255, 0, 0);
      strokeWeight(4);
      ellipse(x, y, 100, 100);
    }
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
