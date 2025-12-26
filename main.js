const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  const colorPicker = document.getElementById("colorPicker");
  const lineWidthInput = document.getElementById("lineWidth");

  let drawing = false;
  let currentTool = "pen";

  
  let strokes = [];
  let currentStroke = null;

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    const pos = getMousePos(e);

    currentStroke = {
      tool: currentTool,
      color: colorPicker.value,
      width: lineWidthInput.value,
      points: [pos]
    };

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const pos = getMousePos(e);
    currentStroke.points.push(pos);

    ctx.lineWidth = currentStroke.width;
    ctx.lineCap = "round";

    if (currentTool === "eraser") {
      ctx.strokeStyle = "white";
    } else {
      ctx.strokeStyle = currentStroke.color;
    }

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  });

  canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.closePath();
    strokes.push(currentStroke);
  });


  document.getElementById("penBtn").onclick = () => currentTool = "pen";
  document.getElementById("eraserBtn").onclick = () => currentTool = "eraser";

  document.getElementById("clearBtn").onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes = [];
    localStorage.removeItem("miniPaint");
  };

  document.getElementById("saveBtn").onclick = () => {
    localStorage.setItem("miniPaint", JSON.stringify(strokes));
    alert("Малюнок збережено!");
  };

  document.getElementById("replayBtn").onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    replayDrawing();
  };

  function replayDrawing() {
    let i = 0;

    function drawStroke() {
      if (i >= strokes.length) return;

      const s = strokes[i];
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.strokeStyle = s.tool === "eraser" ? "white" : s.color;

      let j = 1;
      const interval = setInterval(() => {
        if (j >= s.points.length) {
          clearInterval(interval);
          i++;
          drawStroke();
          return;
        }
        ctx.lineTo(s.points[j].x, s.points[j].y);
        ctx.stroke();
        j++;
      }, 20);
    }

    drawStroke();
  }


  const saved = localStorage.getItem("miniPaint");
  if (saved) {
    strokes = JSON.parse(saved);
    replayDrawing();
  }