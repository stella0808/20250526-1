let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handModelReady);
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function modelReady() {
  // 臉部模型載入完成
}

function handModelReady() {
  // 手部模型載入完成
}

function draw() {
  image(video, 0, 0, width, height);

  // 手部關鍵點與手勢判斷
  let gesture = "";
  if (handPredictions.length > 0) {
    for (let i = 0; i < handPredictions.length; i++) {
      const hand = handPredictions[i];
      for (let j = 0; j < hand.landmarks.length; j++) {
        const [x, y, z] = hand.landmarks[j];
        fill(0, 255, 0);
        noStroke();
        ellipse(width - x, y, 10, 10); // 鏡像x
      }
      gesture = detectGesture(hand.landmarks);
    }
  }

  // 臉部關鍵點（根據手勢決定圓圈位置）
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    let x, y;
    if (gesture === "剪刀") {
      [x, y] = keypoints[10]; // 額頭
    } else if (gesture === "石頭") {
      [x, y] = keypoints[33]; // 左眼睛
    } else if (gesture === "布") {
      [x, y] = keypoints[263]; // 右眼睛
    } else {
      [x, y] = keypoints[94]; // 鼻子
    }
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(width - x, y, 100, 100); // 鏡像x0, 100); // 鏡像x
  }

  // 顯示手勢結果
  fill(0, 0, 0, 180);
  rect(10, 10, 120, 40, 10);
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("手勢: " + gesture, 20, 20);
}

// 手勢判斷函式
function detectGesture(landmarks) {
  // 指尖座標（0:拇指, 8:食指, 12:中指, 16:無名指, 20:小指）
  const tips = [4, 8, 12, 16, 20];
  // 指根座標（2:拇指根, 5:食指根, 9:中指根, 13:無名指根, 17:小指根）
  const bases = [2, 5, 9, 13, 17];

  // 計算每根手指是否伸直（指尖y < 指根y，畫面座標原點在左上）
  let extended = tips.map((tip, i) => {
    return landmarks[tip][1] < landmarks[bases[i]][1];
  });

  // 判斷手勢
  if (extended[1] && extended[2] && !extended[0] && !extended[3] && !extended[4]) {
    return "剪刀";
  } else if (extended.every(e => e)) {
    return "布";
  } else if (extended.every(e => !e)) {
    return "石頭";
  } else {
    return "";
  }
}
