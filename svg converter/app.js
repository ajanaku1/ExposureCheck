// Theme Management
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Get saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// DOM elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const controlsSection = document.getElementById('controlsSection');
const previewSection = document.getElementById('previewSection');
const originalImage = document.getElementById('originalImage');
const svgPreview = document.getElementById('svgPreview');
const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const loading = document.getElementById('loading');
const fileInfo = document.getElementById('fileInfo');

// Control elements
const colorCountSlider = document.getElementById('colorCount');
const smoothnessSlider = document.getElementById('smoothness');
const colorCountValue = document.getElementById('colorCountValue');
const smoothnessValue = document.getElementById('smoothnessValue');

let currentFile = null;
let currentSVG = null;

// Update value displays
colorCountSlider.addEventListener('input', (e) => {
    colorCountValue.textContent = e.target.value;
});

smoothnessSlider.addEventListener('input', (e) => {
    smoothnessValue.textContent = parseFloat(e.target.value).toFixed(1);
});

// File upload handling
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    currentFile = file;
    fileInfo.textContent = `File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

    // Display original image
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        controlsSection.style.display = 'block';
        previewSection.style.display = 'none';
        currentSVG = null;
    };
    reader.readAsDataURL(file);
}

// Check if ImageTracer is loaded
function checkImageTracerLoaded() {
    if (typeof ImageTracer === 'undefined') {
        alert('ImageTracer library is still loading. Please wait a moment and try again.');
        return false;
    }
    return true;
}

// Convert to SVG
convertBtn.addEventListener('click', () => {
    if (!currentFile) {
        alert('Please upload an image first');
        return;
    }

    // Check if ImageTracer is loaded
    if (!checkImageTracerLoaded()) {
        return;
    }

    loading.style.display = 'block';
    previewSection.style.display = 'none';

    try {
        // Get settings
        const colorCount = parseInt(colorCountSlider.value);
        const smoothness = parseFloat(smoothnessSlider.value);

        // Convert using ImageTracer
        const options = {
            ltres: smoothness,
            qtres: smoothness,
            pathomit: 8,
            colorsampling: 1,
            numberofcolors: colorCount,
            mincolorratio: 0.02,
            colorquantcycles: 3,
            scale: 1,
            linefilter: true,
            rightangleenhance: true,
            roundcoords: 1,
            viewbox: true,
            desc: false,
            lcpr: 0,
            qcpr: 0,
            blurradius: 0,
            blurdelta: 20
        };

        // Use ImageTracer to convert (async callback)
        // ImageTracer.imageToSVG(image, callback, options)
        ImageTracer.imageToSVG(
            originalImage.src,
            (svgstr) => {
                if (svgstr) {
                    currentSVG = svgstr;
                    svgPreview.innerHTML = svgstr;
                    loading.style.display = 'none';
                    previewSection.style.display = 'block';
                } else {
                    loading.style.display = 'none';
                    alert('Conversion returned empty result. Please try adjusting the settings.');
                }
            },
            options
        );

    } catch (error) {
        console.error('Conversion error:', error);
        alert('Error converting image: ' + error.message);
        loading.style.display = 'none';
    }
});

// Download SVG
downloadBtn.addEventListener('click', () => {
    if (!currentSVG) {
        alert('Please convert an image first');
        return;
    }

    const blob = new Blob([currentSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name.replace(/\.[^/.]+$/, '') + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Reset
resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    currentFile = null;
    currentSVG = null;
    originalImage.src = '';
    svgPreview.innerHTML = '';
    controlsSection.style.display = 'none';
    previewSection.style.display = 'none';
    fileInfo.textContent = '';
    
    // Reset sliders
    colorCountSlider.value = 16;
    smoothnessSlider.value = 1;
    colorCountValue.textContent = '16';
    smoothnessValue.textContent = '1.0';
});

