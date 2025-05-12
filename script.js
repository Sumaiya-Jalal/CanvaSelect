const imageUpload = document.getElementById('imageUpload');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const colorPalette = document.getElementById('paletteContainer');
const downloadBtn = document.getElementById('downloadBtn');

let selectedColors = new Set();
let colorMap = new Map();

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            imageCanvas.width = 300; // fixed size
            imageCanvas.height = 300; // fixed size
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
        };
        img.src = event.target.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

imageCanvas.addEventListener('click', (e) => {
    const rect = imageCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    
    fetchColorName(hex).then(name => {
        if (!selectedColors.has(name)) {
            selectedColors.add(name);
            colorMap.set(name, hex);
            displayColor(name, hex);
        }
    });
});

function rgbToHex(r, g, b) {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    ).toUpperCase();
}

async function fetchColorName(hex) {
    const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex.replace("#", "")}`);
    const data = await response.json();
    return data.name.value;
}

function displayColor(name, hex) {
    const box = document.createElement('div');
    box.className = 'color-box';
    box.style.backgroundColor = hex;

    const nameText = document.createElement('p');
    nameText.textContent = name;
    nameText.style.fontWeight = 'bold';
    nameText.style.margin = "0";
    nameText.style.color = "#fff";

    const hexText = document.createElement('p');
    hexText.textContent = hex;
    hexText.style.margin = "0";
    hexText.style.color = "#fff";

    box.appendChild(nameText);
    box.appendChild(hexText);
    colorPalette.appendChild(box);
}


downloadBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 200;
    const height = 50;
    const spacing = 10;

    canvas.width = width * selectedColors.size + spacing * (selectedColors.size - 1);
    canvas.height = height;

    let i = 0;
    for (let [name, hex] of colorMap.entries()) {
        ctx.fillStyle = hex;
        ctx.fillRect(i * (width + spacing), 0, width, height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.fillText(name, i * (width + spacing) + 5, 20);
        ctx.fillText(hex, i * (width + spacing) + 5, 40);

        i++;
    }

    const link = document.createElement('a');
    link.download = 'palette.png';
    link.href = canvas.toDataURL();
    link.click();
});

