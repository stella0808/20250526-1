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

  let gesture = "";
  if (handPredictions.length > 0) {
    const hand = handPredictions[0];
    gesture = detectGesture(hand.landmarks);
  }

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    let idx = 94; // 預設鼻子
    if (gesture === "剪刀") {
      idx = 10;
    } else if (gesture === "布") {
      idx = 33;
    } else if (gesture === "石頭") {
      idx = 263;
    }
    // 防呆：確認該點存在
    if (keypoints[idx] && keypoints[idx][0] && keypoints[idx][1]) {
      const [x, y] = keypoints[idx];
      noFill();
      stroke(0, 255, 0); // 改成綠色更明顯
      strokeWeight(8);   // 線條加粗
      ellipse(x, y, 100, 100);
    } else {
      console.log("找不到臉部關鍵點", idx, keypoints[idx]);
    }
  } else {
    console.log("沒有偵測到臉");
  }
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
