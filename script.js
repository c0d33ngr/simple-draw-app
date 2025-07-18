
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const eraserBtn = document.getElementById('eraserBtn');
const saveBtn = document.getElementById('saveBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

let isDrawing = false;
let isErasing = false;
let lastX = 0;
let lastY = 0;

let historyStack = [];
let redoStack = [];

// --- History Management ---
function saveState() {
    redoStack = []; // Clear redo stack on new action
    historyStack.push(canvas.toDataURL());
    updateUndoRedoButtons();
}

function restoreState(dataURL) {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyStack.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
}

function undo() {
    if (historyStack.length > 1) {
        redoStack.push(historyStack.pop());
        restoreState(historyStack[historyStack.length - 1]);
        updateUndoRedoButtons();
    }
}

function redo() {
    if (redoStack.length > 0) {
        const nextState = redoStack.pop();
        historyStack.push(nextState);
        restoreState(nextState);
        updateUndoRedoButtons();
    }
}

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

// Set initial canvas size and on resize
function resizeCanvas() {
    const container = canvas.parentElement;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    if (canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = Math.min(container.clientWidth, 800); // Max width
    canvas.height = canvas.width * 0.75;

    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    // Clear history as old states have wrong dimensions
    historyStack = [];
    redoStack = [];
    saveState(); // Save the resized drawing as the new initial state
    updateUndoRedoButtons();

    // Re-apply settings
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
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
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
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
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
    saveState();
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
