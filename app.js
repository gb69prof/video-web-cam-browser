let recorder;
let chunks = [];

async function startRecording() {
  chunks = [];

  const camStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  });

  const camVideo = document.getElementById("cam");
  const screenVideo = document.getElementById("screen");

  camVideo.srcObject = camStream;
  screenVideo.srcObject = screenStream;

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1280;
  canvas.height = 720;

  function draw() {
    ctx.drawImage(camVideo, 0, 0, 320, 720);
    ctx.drawImage(screenVideo, 320, 0, 960, 720);
    requestAnimationFrame(draw);
  }

  draw();

  const stream = canvas.captureStream(30);

  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = e => chunks.push(e.data);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "lezione.webm";
    a.click();
  };

  recorder.start();
}

function stopRecording() {
  recorder.stop();
}
