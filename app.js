let recorder;
let chunks = [];
let canvasStream;

let camX = 20;
let camY = 20;
let camSize = 200;

let dragging = false;

async function startRecording() {

  chunks = [];

  const camStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  });

  const camVideo = document.createElement("video");
  const screenVideo = document.createElement("video");

  camVideo.srcObject = camStream;
  screenVideo.srcObject = screenStream;

  await camVideo.play();
  await screenVideo.play();

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1280;
  canvas.height = 720;

  // drag webcam
  canvas.addEventListener("mousedown", e => {
    if (e.offsetX > camX && e.offsetX < camX + camSize &&
        e.offsetY > camY && e.offsetY < camY + camSize) {
      dragging = true;
    }
  });

  canvas.addEventListener("mouseup", () => dragging = false);

  canvas.addEventListener("mousemove", e => {
    if (dragging) {
      camX = e.offsetX - camSize / 2;
      camY = e.offsetY - camSize / 2;
    }
  });

  document.getElementById("sizeSlider").oninput = e => {
    camSize = e.target.value;
  };

  function draw() {
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(camVideo, camX, camY, camSize, camSize);
    requestAnimationFrame(draw);
  }

  draw();

  canvasStream = canvas.captureStream(30);

  recorder = new MediaRecorder(canvasStream);

  recorder.ondataavailable = e => chunks.push(e.data);

  recorder.onstop = saveOptions;

  recorder.start();
}

function pauseRecording() {
  if (recorder && recorder.state === "recording") recorder.pause();
}

function resumeRecording() {
  if (recorder && recorder.state === "paused") recorder.resume();
}

function stopRecording() {
  recorder.stop();
}

function saveOptions() {

  const blob = new Blob(chunks, { type: "video/webm" });

  const choice = confirm("Vuoi salvare solo audio? OK = audio, Annulla = video");

  if (choice) {
    extractAudio(blob);
  } else {
    download(blob, "lezione.webm");
  }
}

function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

// audio extraction (semplificata)
function extractAudio(blob) {

  const audio = new Audio(URL.createObjectURL(blob));
  const ctx = new AudioContext();
  const dest = ctx.createMediaStreamDestination();
  const source = ctx.createMediaElementSource(audio);

  source.connect(dest);
  source.connect(ctx.destination);

  const recorder = new MediaRecorder(dest.stream);
  let audioChunks = [];

  recorder.ondataavailable = e => audioChunks.push(e.data);

  recorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    download(audioBlob, "audio.wav");
  };

  recorder.start();
  audio.play();

  audio.onended = () => recorder.stop();
}
