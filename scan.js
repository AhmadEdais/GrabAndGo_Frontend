const state = {
  stream: null,
  scanning: false,
  animationFrameId: null,
};

const video = document.getElementById("scan-video");
const canvas = document.getElementById("scan-canvas");
const canvasCtx = canvas.getContext("2d", { willReadFrequently: true });
const scanText = document.getElementById("scan-text");
const scanError = document.getElementById("scan-error");
const scanErrorText = document.getElementById("scan-error-text");
const btnBackScan = document.getElementById("btn-back-scan");
const btnRetryScan = document.getElementById("btn-retry-scan");

const showError = (message) => {
  stopCamera();
  video.style.display = "none";
  document.querySelector(".scan-overlay").style.display = "none";
  scanError.style.display = "flex";
  scanErrorText.textContent = message;
};

const stopCamera = () => {
  state.scanning = false;
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
  }
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
  }
};

const extractGateRedirect = (decodedText) => {
  try {
    const url = new URL(decodedText);
    const gateToken = url.searchParams.get("gateToken");
    if (!gateToken) return null;

    return `entering-store.html?gateToken=${encodeURIComponent(decodeURIComponent(gateToken))}`;
  } catch {
    return null;
  }
};

let frameCount = 0;

const tick = () => {
  if (!state.scanning) return;

  try {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // log once every ~60 frames so it doesn't flood
      if (frameCount % 60 === 0) {
        console.log(
          "tick running — canvas:",
          canvas.width,
          "x",
          canvas.height,
          "| video:",
          video.videoWidth,
          "x",
          video.videoHeight,
        );
      }
      frameCount++;

      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvasCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth", // ← changed, see below
      });

      if (code) {
        console.log("jsQR RETURNED SOMETHING:", code.data);
      }

      if (code && code.data) {
        const redirectUrl = extractGateRedirect(code.data);
        console.log("decoded:", code.data, "| redirectUrl:", redirectUrl);
        if (redirectUrl) {
          scanText.textContent = "Code recognized — entering store...";
          stopCamera();
          window.location.href = redirectUrl;
          return;
        }
      }
    } else {
      if (frameCount % 60 === 0)
        console.log("video not ready, readyState:", video.readyState);
    }
  } catch (err) {
    console.error("Scan tick error:", err);
  }

  state.animationFrameId = requestAnimationFrame(tick);
};

const startCamera = async () => {
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = state.stream;
    await video.play();
    state.scanning = true;
    state.animationFrameId = requestAnimationFrame(tick);
  } catch (err) {
    showError(
      "Could not access the camera. Please allow camera permissions and try again.",
    );
  }
};

btnBackScan.addEventListener("click", () => {
  stopCamera();
  window.location.href = "home.html";
});

btnRetryScan.addEventListener("click", () => {
  window.location.reload();
});
video.addEventListener("loadedmetadata", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});
const init = async () => {
  const existingSession = await API.getActiveSession();

  if (existingSession) {
    if (existingSession.isTracked) {
      window.location.href = "live-cart.html";
    } else {
      window.location.href = `entering-store.html?sessionId=${existingSession.sessionId}`;
    }
    return;
  }
  startCamera();
};

init();
