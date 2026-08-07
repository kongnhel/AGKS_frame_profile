const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('upload');
const zoomInput = document.getElementById('zoom');
const zoomVal = document.getElementById('zoomVal');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const hint = document.getElementById('hint');
const canvasOverlay = document.getElementById('canvasOverlay');
const sliderGroup = document.getElementById('sliderGroup');
const actionRow = document.getElementById('actionRow');
const uploadBtn = document.getElementById('uploadBtn');

const frameImage = new Image();
frameImage.src = 'frame.png';

let userImage = null;
let imgX = canvas.width / 2;
let imgY = canvas.height / 2;
let imgScale = 1;
let isDragging = false;
let startX, startY;

frameImage.onload = () => draw();

function openFile() {
  uploadInput.click();
}

// Click overlay to upload
canvasOverlay.addEventListener('click', openFile);

// Upload button
uploadBtn.addEventListener('click', openFile);

// Drag and drop on canvas area
const canvasWrap = document.querySelector('.canvas-wrap');
canvasWrap.addEventListener('dragover', (e) => e.preventDefault());
canvasWrap.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadFile(file);
});

uploadInput.addEventListener('change', (e) => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
});

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      userImage = img;
      imgX = canvas.width / 2;
      imgY = canvas.height / 2;
      imgScale = canvas.width / Math.min(userImage.width, userImage.height);
      zoomInput.value = imgScale;
      zoomVal.textContent = Math.round(imgScale * 100) + '%';
      hint.textContent = 'ទាញរូបថតដើម្បីផ្លាស់ទី · ប្រើរបារពង្រីក · ចុច Download';
      canvasOverlay.classList.add('hidden');
      sliderGroup.style.display = '';
      actionRow.style.display = '';
      canvas.style.cursor = 'grab';
      draw();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Mouse drag
canvas.addEventListener('mousedown', (e) => {
  if (!userImage) return;
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  startX = (e.clientX - rect.left) * (canvas.width / rect.width) - imgX;
  startY = (e.clientY - rect.top) * (canvas.height / rect.height) - imgY;
  canvas.style.cursor = 'grabbing';
  e.preventDefault();
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || !userImage) return;
  const rect = canvas.getBoundingClientRect();
  imgX = (e.clientX - rect.left) * (canvas.width / rect.width) - startX;
  imgY = (e.clientY - rect.top) * (canvas.height / rect.height) - startY;
  draw();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  if (userImage) canvas.style.cursor = 'grab';
});

// Touch drag
canvas.addEventListener('touchstart', (e) => {
  if (!userImage || !e.touches.length) return;
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  startX = (t.clientX - rect.left) * (canvas.width / rect.width) - imgX;
  startY = (t.clientY - rect.top) * (canvas.height / rect.height) - imgY;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!isDragging || !userImage || !e.touches.length) return;
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  imgX = (t.clientX - rect.left) * (canvas.width / rect.width) - startX;
  imgY = (t.clientY - rect.top) * (canvas.height / rect.height) - startY;
  draw();
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', () => { isDragging = false; });

// Zoom
zoomInput.addEventListener('input', (e) => {
  imgScale = parseFloat(e.target.value);
  zoomVal.textContent = Math.round(imgScale * 100) + '%';
  draw();
});

// Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userImage) {
    ctx.save();
    ctx.translate(imgX, imgY);
    ctx.scale(imgScale, imgScale);
    ctx.drawImage(userImage, -userImage.width / 2, -userImage.height / 2);
    ctx.restore();
  }

  ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}

// Reset
resetBtn.addEventListener('click', () => {
  userImage = null;
  imgX = canvas.width / 2;
  imgY = canvas.height / 2;
  imgScale = 1;
  zoomInput.value = 1;
  zoomVal.textContent = '100%';
  hint.textContent = 'រូបភាពនៅពីក្រោយស៊ុម · ទាញដើម្បីផ្លាស់ទី · ប្រើរបារពង្រីក';
  canvasOverlay.classList.remove('hidden');
  sliderGroup.style.display = 'none';
  actionRow.style.display = 'none';
  canvas.style.cursor = 'move';
  uploadInput.value = '';
  draw();
});

// Download
downloadBtn.addEventListener('click', () => {
  if (!userImage) return;
  const link = document.createElement('a');
  link.download = 'agks-profile.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
