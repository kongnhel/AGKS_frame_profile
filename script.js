const $ = (s) => document.querySelector(s);

const step1 = $('#step1');
const step2 = $('#step2');
const uploadZone = $('#uploadZone');
const fileInput = $('#fileInput');
const previewCanvas = $('#previewCanvas');
const exportCanvas = $('#exportCanvas');
const zoomSlider = $('#zoomSlider');
const zoomValue = $('#zoomValue');
const previewFrame = $('#previewFrame');
const dragHint = $('#dragHint');

const FRAME_SRC = 'frame.png';
const CIRCLE = { xRatio: 0.5, yRatio: 0.465, radiusRatio: 0.305 };

let frameImg = null;
let userImg = null;
let zoom = 1;
let offsetX = 0, offsetY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let offsetStart = { x: 0, y: 0 };

// Preload frame
const frameLoad = new Promise((resolve) => {
    frameImg = new Image();
    frameImg.onload = () => resolve();
    frameImg.src = FRAME_SRC;
});

// --- Upload ---
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) loadFile(f);
});
fileInput.addEventListener('change', (e) => { if (e.target.files[0]) loadFile(e.target.files[0]); });

function loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            userImg = img;
            resetState();
            showStep2();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function resetState() {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    zoomSlider.value = 100;
    zoomValue.textContent = '100%';
}

// --- Step Navigation ---
function showStep2() {
    step1.classList.remove('active');
    step2.classList.add('active');
    frameLoad.then(() => renderPreview());
}

$('#backBtn').addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
});

$('#changePhotoBtn').addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
    fileInput.value = '';
});

$('#resetBtn').addEventListener('click', () => {
    resetState();
    renderPreview();
});

// --- Zoom ---
zoomSlider.addEventListener('input', () => {
    zoom = parseInt(zoomSlider.value) / 100;
    zoomValue.textContent = zoomSlider.value + '%';
    renderPreview();
});

// --- Drag ---
previewFrame.addEventListener('mousedown', startDrag);
previewFrame.addEventListener('touchstart', startDrag, { passive: false });

function startDrag(e) {
    isDragging = true;
    const pt = e.touches ? e.touches[0] : e;
    dragStart = { x: pt.clientX, y: pt.clientY };
    offsetStart = { x: offsetX, y: offsetY };
    dragHint.style.opacity = '0';
    e.preventDefault();
}

window.addEventListener('mousemove', onDrag);
window.addEventListener('touchmove', onDrag, { passive: false });

function onDrag(e) {
    if (!isDragging) return;
    const pt = e.touches ? e.touches[0] : e;
    const rect = previewFrame.getBoundingClientRect();
    const scaleX = previewCanvas.width / rect.width;
    const scaleY = previewCanvas.height / rect.height;
    offsetX = offsetStart.x + (pt.clientX - dragStart.x) * scaleX;
    offsetY = offsetStart.y + (pt.clientY - dragStart.y) * scaleY;
    renderPreview();
    e.preventDefault();
}

window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('touchend', () => { isDragging = false; });

// --- Render ---
function renderPreview() {
    if (!userImg || !frameImg) return;

    const fw = frameImg.naturalWidth;
    const fh = frameImg.naturalHeight;

    previewCanvas.width = fw;
    previewCanvas.height = fh;
    const ctx = previewCanvas.getContext('2d');

    const cx = fw * CIRCLE.xRatio;
    const cy = fh * CIRCLE.yRatio;
    const r = fw * CIRCLE.radiusRatio;

    // Draw user photo clipped to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const baseSize = r * 2;
    const imgAspect = userImg.naturalWidth / userImg.naturalHeight;
    let sw, sh;
    if (imgAspect > 1) {
        sh = baseSize;
        sw = sh * imgAspect;
    } else {
        sw = baseSize;
        sh = sw / imgAspect;
    }

    sw *= zoom;
    sh *= zoom;

    const sx = cx - sw / 2 + offsetX;
    const sy = cy - sh / 2 + offsetY;

    ctx.drawImage(userImg, sx, sy, sw, sh);
    ctx.restore();

    // Draw frame on top
    ctx.drawImage(frameImg, 0, 0, fw, fh);
}

// --- Download ---
$('#downloadBtn').addEventListener('click', async () => {
    if (!userImg || !frameImg) return;

    await frameLoad;

    const fw = frameImg.naturalWidth;
    const fh = frameImg.naturalHeight;

    exportCanvas.width = fw;
    exportCanvas.height = fh;
    const ctx = exportCanvas.getContext('2d');

    const cx = fw * CIRCLE.xRatio;
    const cy = fh * CIRCLE.yRatio;
    const r = fw * CIRCLE.radiusRatio;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const baseSize = r * 2;
    const imgAspect = userImg.naturalWidth / userImg.naturalHeight;
    let sw, sh;
    if (imgAspect > 1) {
        sh = baseSize;
        sw = sh * imgAspect;
    } else {
        sw = baseSize;
        sh = sw / imgAspect;
    }

    sw *= zoom;
    sh *= zoom;

    const sx = cx - sw / 2 + offsetX;
    const sy = cy - sh / 2 + offsetY;

    ctx.drawImage(userImg, sx, sy, sw, sh);
    ctx.restore();

    ctx.drawImage(frameImg, 0, 0, fw, fh);

    const link = document.createElement('a');
    link.download = 'agks-profile.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
});
