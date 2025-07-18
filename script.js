
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const eraserBtn = document.getElementById('eraserBtn');
const saveBtn = document.getElementById('saveBtn');

let isDrawing = false;
let isErasing = false;
let lastX = 0;
let lastY = 0;

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function updateBrushSize() {
    ctx.lineWidth = brushSize.value;
    brushSizeValue.textContent = brushSize.value;
}

brushSize.addEventListener('input', updateBrushSize);

function draw(e) {
    if (!isDrawing) return;
    if (isErasing) {
        ctx.strokeStyle = '#ffffff';
    } else {
        ctx.strokeStyle = colorPicker.value;
    }
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

eraserBtn.addEventListener('click', () => {
    isErasing = !isErasing;
    eraserBtn.textContent = isErasing ? 'Brush' : 'Eraser';
});

colorPicker.addEventListener('change', () => {
    isErasing = false;
    eraserBtn.textContent = 'Eraser';
});

saveBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
});

// Initialize brush size
updateBrushSize();
