
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

// Set initial canvas size and on resize
function resizeCanvas() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    // Calculate height based on a 4:3 aspect ratio
    canvas.height = canvas.width * 0.75;
    ctx.putImageData(imageData, 0, 0);
    // Re-apply line settings after resize
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    updateBrushSize();
}

window.addEventListener('resize', resizeCanvas);


ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function updateBrushSize() {
    ctx.lineWidth = brushSize.value;
    brushSizeValue.textContent = brushSize.value;
}

function getCoords(e) {
    if (e.touches && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
    }
    return [e.offsetX, e.offsetY];
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoords(e);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on mobile

    const [currentX, currentY] = getCoords(e);

    if (isErasing) {
        ctx.strokeStyle = '#ffffff'; // Use white for erasing
    } else {
        ctx.strokeStyle = colorPicker.value;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    [lastX, lastY] = [currentX, currentY];
}

function stopDrawing() {
    isDrawing = false;
}

// Mouse event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch event listeners
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

brushSize.addEventListener('input', updateBrushSize);

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

eraserBtn.addEventListener('click', () => {
    isErasing = !isErasing;
    eraserBtn.textContent = isErasing ? 'Brush' : 'Eraser';
    eraserBtn.classList.toggle('active', isErasing);
});

colorPicker.addEventListener('input', () => {
    isErasing = false;
    eraserBtn.textContent = 'Eraser';
    eraserBtn.classList.remove('active');
});

saveBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
});

// Initialize
resizeCanvas();
updateBrushSize();
