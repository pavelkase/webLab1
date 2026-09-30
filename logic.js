const form = document.getElementById("formochka");
const tbody = document.getElementById("resultBody");
const STORAGE_KEY = "lab1_results";

let currentR = null;
let results = loadResults();

function checkHit(x, y, r) {
    if (y <= r && y >= 0 && x >= -r && x <= 0) {
        return true;
    }
    if (y >= 0 && x >= 0 && x ** 2 + y ** 2 <= (r / 2) ** 2) {
        return true;
    }
    if (x >= 0 && y <= 0 && y >= x / 2 - r / 2) {
        return true;
    }
    return false;
}

function loadResults() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveResults() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
        console.error("Не удалось сохранить результаты", e);
    }
}

function renderTable() {
    tbody.innerHTML = "";
    results.forEach((item) => {
        const tr = document.createElement("tr");
        const cells = [
            item.x,
            item.y,
            item.r,
            item.hit ? "Попадание" : "Промах",
            new Date(item.time).toLocaleString("ru-RU"),
        ];
        cells.forEach((value) => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function parseX(str) {
    str = str.trim().replace(",", ".");
    if (!/^[+-]?\d+(\.\d+)?$/.test(str)) {
        return NaN;
    }
    return parseFloat(str);
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const x = parseX(document.getElementById("xInput").value);
    if (isNaN(x) || x < -5 || x > 5) {
        alert("X должен быть числом в промежутке от -5 до 5");
        return;
    }

    const yChecked = document.querySelectorAll("input[name=yVal]:checked");
    if (yChecked.length !== 1) {
        alert("Выберите строго одно значение для Y");
        return;
    }
    const y = parseFloat(yChecked[0].value);

    if (currentR === null) {
        alert("Выберите R");
        return;
    }

    const hit = checkHit(x, y, currentR);
    results.push({ x: x, y: y, r: currentR, hit: hit, time: Date.now() });
    saveResults();
    renderTable();
    draw();
});

const rButtons = document.querySelectorAll(".radiusKnopochka");
rButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentR = parseFloat(btn.textContent);
        rButtons.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        draw();
    });
});

const canvas = document.getElementById("canvasik");
const ctx = canvas.getContext("2d");
const CX = canvas.width / 2;
const CY = canvas.height / 2;


const UNIT = 55;

function drawArrow(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 7), y2 - 10 * Math.sin(angle - Math.PI / 7));
    ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 7), y2 - 10 * Math.sin(angle + Math.PI / 7));
    ctx.closePath();
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentR !== null) {
        const rPx = currentR * UNIT;

        ctx.fillStyle = "#3399FF";

        ctx.fillRect(CX - rPx, CY - rPx, rPx, rPx);

        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(CX + rPx, CY);
        ctx.lineTo(CX, CY + rPx / 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, rPx / 2, -Math.PI / 2, 0, false);
        ctx.closePath();
        ctx.fill();
    }

    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.lineWidth = 1;
    drawArrow(10, CY, canvas.width - 10, CY);
    drawArrow(CX, canvas.height - 10, CX, 10);

    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("x", canvas.width - 14, CY + 20);
    ctx.fillText("y", CX + 10, 16);


    if (currentR !== null) {
        [1, 0.5, -0.5, -1].forEach((k) => {
            const off = k * currentR * UNIT;
            const label = String(+(k * currentR).toFixed(2));

            ctx.beginPath();
            ctx.moveTo(CX + off, CY - 4);
            ctx.lineTo(CX + off, CY + 4);
            ctx.stroke();
            ctx.textAlign = "center";
            ctx.fillText(label, CX + off, CY - 8);

            ctx.beginPath();
            ctx.moveTo(CX - 4, CY - off);
            ctx.lineTo(CX + 4, CY - off);
            ctx.stroke();
            ctx.textAlign = "left";
            ctx.fillText(label, CX + 8, CY - off + 4);
        });
    }


    results.forEach((p) => {
        const px = CX + p.x * UNIT;
        const py = CY - p.y * UNIT;
        ctx.fillStyle = p.hit ? "lime" : "red";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

draw();
renderTable();
