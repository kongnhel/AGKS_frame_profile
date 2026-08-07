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

// Click overlay to upload
canvasOverlay.addEventListener('click', () => fileInput.click());

// Upload button
uploadBtn.addEventListener('click', () => uploadInput.click());

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    userImage = new Image();
    userImage.onload = () => {
      imgX = canvas.width / 2;
      imgY = canvas.height / 2;
      imgScale = canvas.width / Math.min(userImage.width, userImage.height);
      zoomInput.value = imgScale;
      zoomVal.textContent = Math.round(imgScale * 100) + '%';
      hint.textContent = 'ទាញរូបថតដើម្បីផ្លាស់ទី · ប្រើរបារពង្រីក · ចុច Download';
      canvasOverlay.classList.add('hidden');
      sliderGroup.style.display = '';
      actionRow.style.display = '';
      draw();
    };
    userImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Drag
canvas.addEventListener('mousedown', (e) => {
  if (!userImage) return;
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  startX = (e.clientX - rect.left) * scaleX - imgX;
  startY = (e.clientY - rect.top) * scaleY - imgY;
  canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || !userImage) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  imgX = (e.clientX - rect.left) * scaleX - startX;
  imgY = (e.clientY - rect.top) * scaleY - startY;
  draw();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = userImage ? 'grab' : 'move';
});

// Touch
canvas.addEventListener('touchstart', (e) => {
  if (!userImage) return;
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const t = e.touches[0];
  startX = (t.clientX - rect.left) * scaleX - imgX;
  startY = (t.clientY - rect.top) * scaleY - imgY;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!isDragging || !userImage) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const t = e.touches[0];
  imgX = (t.clientX - rect.left) * scaleX - startX;
  imgY = (t.clientY - rect.top) * scaleY - startY;
  draw();
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', () => isDragging = false);

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
