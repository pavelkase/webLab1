let currentR = null;

document.addEventListener("DOMContentLoaded", () => {
    drawCanvas();
    loadTable();
});

const rButtons = document.querySelectorAll('.radiusKnopochka');

rButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        rButtons.forEach(b => b.style.backgroundColor = 'aqua');
        e.target.style.backgroundColor = 'teal'; 
        
        currentR = parseFloat(e.target.innerText);
        drawCanvas(); 
    });
});

const form = document.getElementById('formochka');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const xStr = document.getElementById('xInput').value.replace(',', '.');
    const x = parseFloat(xStr);
    
    if (isNaN(x) || x < -5 || x > 5) {
        alert("Ошибка: X должен быть числом от -5 до 5");
        return; 
    }

    const yChecked = document.querySelectorAll('input[name="yVal"]:checked');
    if (yChecked.length !== 1) {
        alert("Ошибка: Выберите ровно одно значение Y");
        return;
    }
    const y = parseFloat(yChecked[0].value);

    if (currentR === null) {
        alert("Ошибка: Пожалуйста, выберите значение R");
        return;
    }

    const hitSquare = (x <= 0 && x >= -currentR) && (y >= 0 && y <= currentR);
    const hitTriangle = (x >= 0 && y <= 0) && (y >= x - (currentR / 2));
    const isHit = hitSquare || hitTriangle;

    const timeString = new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'short',
        timeStyle: 'medium'
    }).format(new Date());

    const resultObj = { x: x, y: y, r: currentR, hit: isHit, time: timeString };
    
    saveResult(resultObj);
    addTableRow(resultObj);
    drawCanvas();
});

function saveResult(res) {
    let history = JSON.parse(localStorage.getItem('lab_history')) || [];
    history.push(res);
    localStorage.setItem('lab_history', JSON.stringify(history));
}

function loadTable() {
    let history = JSON.parse(localStorage.getItem('lab_history')) || [];
    history.forEach(res => addTableRow(res));
}

function addTableRow(res) {
    const tbody = document.querySelector('#results tbody');
    if (!tbody) {
        document.getElementById('results').innerHTML += '<tbody></tbody>';
    }
    
    const table = document.querySelector('#results tbody');
    const row = table.insertRow();
    
    const resultText = res.hit ? '<span style="color: green">Попадание</span>' : '<span style="color: red">Промах</span>';

    row.innerHTML = `
        <td>${res.x}</td>
        <td>${res.y}</td>
        <td>${res.r}</td>
        <td>${resultText}</td>
        <td>${res.time}</td>
    `;
}

function drawCanvas() {
    const canvas = document.getElementById('canvasik');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;  
    const h = canvas.height; 
    
    const scale = 40; 
    
    ctx.clearRect(0, 0, w, h);
    
    if (currentR !== null) {
        const rPx = currentR * scale;
        ctx.fillStyle = '#3498db'; 

        ctx.fillRect(w/2 - rPx, h/2 - rPx, rPx, rPx);

        ctx.beginPath();
        ctx.moveTo(w/2, h/2); 
        ctx.lineTo(w/2 + rPx/2, h/2); 
        ctx.lineTo(w/2, h/2 + rPx/2); 
        ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); 
    ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); 
    ctx.strokeStyle = 'white';
    ctx.stroke();

    let history = JSON.parse(localStorage.getItem('lab_history')) || [];
    history.forEach(pt => {
        const cx = w/2 + pt.x * scale;
        const cy = h/2 - pt.y * scale; 

        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2); 
        ctx.fillStyle = pt.hit ? '#2ecc71' : '#e74c3c'; 
        ctx.fill();
    });
}
