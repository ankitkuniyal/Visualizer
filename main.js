// Welcome Animation Logic
document.addEventListener("DOMContentLoaded", function () {
  const welcomeScreen = document.getElementById("welcome-screen");
  const mainContent = document.getElementById("main-content");
  const startBtn = document.getElementById("start-btn");

  startBtn.addEventListener("click", function () {
    welcomeScreen.classList.add("hide");
    setTimeout(() => {
      welcomeScreen.style.display = "none";
      mainContent.style.display = "block";
      // Now initialize the main app logic
      initMusicCircles();
    }, 700);
  });

  // Optionally, allow pressing Enter to start
  document.addEventListener("keydown", function (e) {
    if (
      welcomeScreen.style.display !== "none" &&
      (e.key === "Enter" || e.key === " ")
    ) {
      startBtn.click();
    }
  });
});

// Main App Logic (moved into a function so it runs after welcome)
function initMusicCircles() {
  const circles = document.querySelectorAll(".circle");
  let currentAudio = null;
  let currentAudioFile = null;
  let audioPositions = {}; // Store playback positions by audio file
  let animationFrameIds = [];
  const header = document.getElementById("main-header");
  const defaultHeader =
    "Hello !! 👋🏻<br>Discover insights from your music listening habits";

  // Animate the sine wave with smooth movement
  function animateWave(svg) {
    const path = svg.querySelector("g path");
    const viewBox = svg.getAttribute("viewBox").split(" ");
    const width = parseFloat(viewBox[2]);
    const height = parseFloat(viewBox[3]);
    const centerY = height / 2;
    let phase = 0;
    function updateWave() {
      const points = [];
      const segments = 20;
      const amplitude = height * 0.25;
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width;
        const y =
          centerY + amplitude * Math.sin((i / segments) * Math.PI * 4 + phase);
        points.push({ x, y });
      }
      let pathData = `M${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        pathData += ` Q${points[i - 1].x},${points[i - 1].y} ${xc},${yc}`;
      }
      path.setAttribute("d", pathData);
      phase += 0.05;
      const animationId = requestAnimationFrame(updateWave);
      animationFrameIds.push(animationId);
    }
    updateWave();
  }

  // Initialize wave animations
  document.querySelectorAll(".wave").forEach((wave) => {
    animateWave(wave);
  });

  // Helper to animate header text transition
  function animateHeaderChange(newHtml) {
    header.classList.add("animating");
    setTimeout(() => {
      header.innerHTML = newHtml;
      header.classList.remove("animating");
    }, 350);
  }

  // Helper to animate time-value and label
  function animateCircleTransition(circle, entering) {
    // Animate the time-value
    const timeValue = circle.querySelector(".time-value");
    if (timeValue) {
      if (entering) {
        timeValue.classList.add("animating");
      } else {
        timeValue.classList.remove("animating");
      }
    }
    // Animate the circle itself
    if (entering) {
      circle.classList.add("hover-animate");
    } else {
      circle.classList.remove("hover-animate");
    }
  }

  // Handle circle hover
  circles.forEach((circle) => {
    circle.addEventListener("mouseenter", function () {
      // Stop any currently playing audio and save its position
      if (currentAudio) {
        if (currentAudioFile) {
          audioPositions[currentAudioFile] = currentAudio.currentTime;
        }
        currentAudio.pause();
      }

      // Set volume: highest at morning, lowest at night
      let volume;
      if (circle.classList.contains("morning")) {
        volume = 1.0;
      } else if (circle.classList.contains("afternoon")) {
        volume = 0.7;
      } else if (circle.classList.contains("evening")) {
        volume = 0.4;
      } else if (circle.classList.contains("night")) {
        volume = 0.15;
      } else {
        volume = 0.5;
      }

      // Create and play audio (replace with your actual audio files)
      const audioFile = circle.getAttribute("data-audio");
      currentAudioFile = audioFile;
      currentAudio = new Audio(audioFile);
      currentAudio.volume = volume;
      currentAudio.loop = true;

      // Resume from last position if available
      if (audioPositions[audioFile]) {
        currentAudio.currentTime = audioPositions[audioFile];
      }

      // Try to play audio (may require user interaction on some browsers)
      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      }

      // Animate header text
      if (circle.hasAttribute("data-header")) {
        animateHeaderChange(circle.getAttribute("data-header"));
      }

      // Animate time-value and circle
      animateCircleTransition(circle, true);
    });

    circle.addEventListener("mouseleave", function () {
      if (currentAudio) {
        if (currentAudioFile) {
          audioPositions[currentAudioFile] = currentAudio.currentTime;
        }
        currentAudio.pause();
      }
      animateHeaderChange(defaultHeader);
      animateCircleTransition(circle, false);
    });
  });

  // Clean up animation frames when page is unloaded
  window.addEventListener("beforeunload", function () {
    animationFrameIds.forEach((id) => cancelAnimationFrame(id));
  });
}
