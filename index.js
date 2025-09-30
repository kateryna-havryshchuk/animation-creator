//Початкова ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('coordinatePlane');
    const ctx = canvas.getContext('2d');
    const coordsDisplay = document.getElementById('coords-display');
   
    //Налаштування вигляду
    const viewSettings = {
        xMin: -10,
        xMax: 10,
        yMin: -10,
        yMax: 10
    };
   
    //Налаштовувані параметри
    let settings = {
        unitLength: 50,
        gridStep: 1,
        axisColor: '#000000',
        gridColor: '#cccccc'
    };

    //Дані паралелограма
    let parallelogram = {
        vertices: [],
        originalVertices: [],
        pivotVertexIndex: 0,
        scaleFactorA: 2,
        rotationAngle: 0,
        isAnimating: false,
        animationSpeed: 0.02,
        transformationMatrix: null
    };

    //Параметри анімації
    let animationId = null;
    const MAX_ROTATION = Math.PI * 2;
    
    //Ініціалізація інтерфейсу
    document.getElementById('unitLength').value = settings.unitLength;
    document.getElementById('unitLengthNumber').value = settings.unitLength;
    document.getElementById('gridStep').value = settings.gridStep;
    document.getElementById('gridStepNumber').value = settings.gridStep;
    document.getElementById('axisColor').value = settings.axisColor;
    document.getElementById('gridColor').value = settings.gridColor;
    document.getElementById('scaleFactor').value = parallelogram.scaleFactorA;
    document.getElementById('animationSpeed').value = parallelogram.animationSpeed;
    document.getElementById('animationSpeedValue').textContent = parallelogram.animationSpeed.toFixed(2);

    function resizeCanvas() {
        const containerWidth = canvas.parentElement.clientWidth;
        const containerHeight = canvas.parentElement.clientHeight - 80;
        
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        drawCoordinatePlane();
        drawParallelogram();
    }

    // Малює координатну площину з сіткою, осями та мітками
    function drawCoordinatePlane() {
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const originX = width / 2;
        const originY = height / 2;
        
        const scale = settings.unitLength;
        
        const xUnitsVisible = Math.ceil(width / scale / 2);
        const yUnitsVisible = Math.ceil(height / scale / 2);
        
        ctx.strokeStyle = settings.gridColor;
        ctx.lineWidth = 0.5;
        
        for (let x = settings.gridStep; x <= xUnitsVisible; x += settings.gridStep) {
            const xPos = originX + x * scale;
            if (xPos <= width) {
                ctx.beginPath();
                ctx.moveTo(xPos, 0);
                ctx.lineTo(xPos, height);
                ctx.stroke();
            }
        }
        
        for (let x = -settings.gridStep; x >= -xUnitsVisible; x -= settings.gridStep) {
            const xPos = originX + x * scale;
            if (xPos >= 0) {
                ctx.beginPath();
                ctx.moveTo(xPos, 0);
                ctx.lineTo(xPos, height);
                ctx.stroke();
            }
        }
        
        for (let y = settings.gridStep; y <= yUnitsVisible; y += settings.gridStep) {
            const yPos = originY - y * scale;
            if (yPos >= 0) {
                ctx.beginPath();
                ctx.moveTo(0, yPos);
                ctx.lineTo(width, yPos);
                ctx.stroke();
            }
        }
        
        for (let y = -settings.gridStep; y >= -yUnitsVisible; y -= settings.gridStep) {
            const yPos = originY - y * scale;
            if (yPos <= height) {
                ctx.beginPath();
                ctx.moveTo(0, yPos);
                ctx.lineTo(width, yPos);
                ctx.stroke();
            }
        }
        
        ctx.strokeStyle = settings.axisColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height);
        ctx.stroke();
        
        drawArrow(width - 10, originY, width, originY, 10, settings.axisColor);
        drawArrow(originX, 10, originX, 0, 10, settings.axisColor);
        
        ctx.font = '11px Arial';
        ctx.fillStyle = settings.axisColor;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        for (let x = settings.gridStep; x <= xUnitsVisible; x += settings.gridStep) {
            const xPos = originX + x * scale;
            if (xPos <= width) {
                ctx.beginPath();
                ctx.moveTo(xPos, originY - 4);
                ctx.lineTo(xPos, originY + 4);
                ctx.stroke();
                ctx.fillText(x.toString(), xPos, originY + 5);
            }
        }
        
        for (let x = -settings.gridStep; x >= -xUnitsVisible; x -= settings.gridStep) {
            const xPos = originX + x * scale;
            if (xPos >= 0) {
                ctx.beginPath();
                ctx.moveTo(xPos, originY - 4);
                ctx.lineTo(xPos, originY + 4);
                ctx.stroke();
                ctx.fillText(x.toString(), xPos, originY + 5);
            }
        }
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let y = settings.gridStep; y <= yUnitsVisible; y += settings.gridStep) {
            const yPos = originY - y * scale;
            if (yPos >= 0) {
                ctx.beginPath();
                ctx.moveTo(originX - 4, yPos);
                ctx.lineTo(originX + 4, yPos);
                ctx.stroke();
                ctx.fillText(y.toString(), originX - 6, yPos);
            }
        }
        
        for (let y = -settings.gridStep; y >= -yUnitsVisible; y -= settings.gridStep) {
            const yPos = originY - y * scale;
            if (yPos <= height) {
                ctx.beginPath();
                ctx.moveTo(originX - 4, yPos);
                ctx.lineTo(originX + 4, yPos);
                ctx.stroke();
                ctx.fillText(y.toString(), originX - 6, yPos);
            }
        }
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', originX - 3, originY + 3);
        
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('X', width - 12, originY - 15);
        ctx.textAlign = 'left';
        ctx.fillText('Y', originX + 12, 12);
        
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`1 одиниця = ${settings.unitLength}px`, 10, 10);
    }

    // Малює стрілку на кінці осі
    function drawArrow(fromX, fromY, toX, toY, headSize, color) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headSize * Math.cos(angle - Math.PI/6), 
            toY - headSize * Math.sin(angle - Math.PI/6)
        );
        ctx.lineTo(
            toX - headSize * Math.cos(angle + Math.PI/6), 
            toY - headSize * Math.sin(angle + Math.PI/6)
        );
        ctx.closePath();
        ctx.fill();
    }

    // Оновлює відображення координат курсору в математичній системі
    function handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const originX = canvas.width / 2;
        const originY = canvas.height / 2;
        const scale = settings.unitLength;
        const mathX = ((x - originX) / scale).toFixed(2);
        const mathY = ((originY - y) / scale).toFixed(2);
        coordsDisplay.textContent = `Координати: (${mathX}, ${mathY})`;
    }

    // Змінює масштаб координатної площини при прокручуванні колеса миші
    function handleMouseWheel(event) {
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newUnitLength = Math.max(20, Math.min(200, settings.unitLength * zoomFactor));
        settings.unitLength = Math.round(newUnitLength);
        document.getElementById('unitLength').value = settings.unitLength;
        document.getElementById('unitLengthNumber').value = settings.unitLength;
        drawCoordinatePlane();
        drawParallelogram();
    }

   // Застосовує налаштування з інтерфейсу користувача
    function applySettings() {
        settings.unitLength = parseInt(document.getElementById('unitLengthNumber').value);
        settings.gridStep = parseInt(document.getElementById('gridStepNumber').value);
        settings.axisColor = document.getElementById('axisColor').value;
        settings.gridColor = document.getElementById('gridColor').value;
        let scaleFactorA = parseFloat(document.getElementById('scaleFactor').value);
        parallelogram.scaleFactorA = Math.max(-1000, Math.min(1000, scaleFactorA));
        parallelogram.animationSpeed = parseFloat(document.getElementById('animationSpeed').value);
        console.log('applySettings: Використане scaleFactorA =', parallelogram.scaleFactorA);
        document.getElementById('scaleFactor').value = parallelogram.scaleFactorA;
        document.getElementById('animationSpeed').value = parallelogram.animationSpeed;
        document.getElementById('animationSpeedValue').textContent = parallelogram.animationSpeed.toFixed(2);
        drawCoordinatePlane();
        drawParallelogram();
    }

    //Скинути налаштування
    function resetSettings() {
        settings = {
            unitLength: 50,
            gridStep: 1,
            axisColor: '#000000',
            gridColor: '#cccccc'
        };
        parallelogram.scaleFactorA = 2;
        parallelogram.animationSpeed = 0.02;
        document.getElementById('unitLength').value = settings.unitLength;
        document.getElementById('unitLengthNumber').value = settings.unitLength;
        document.getElementById('gridStep').value = settings.gridStep;
        document.getElementById('gridStepNumber').value = settings.gridStep;
        document.getElementById('axisColor').value = settings.axisColor;
        document.getElementById('gridColor').value = settings.gridColor;
        document.getElementById('scaleFactor').value = parallelogram.scaleFactorA;
        document.getElementById('animationSpeed').value = parallelogram.animationSpeed;
        document.getElementById('animationSpeedValue').textContent = parallelogram.animationSpeed.toFixed(2);
        drawCoordinatePlane();
        drawParallelogram();
    }

    // Theme toggle
    function toggleTheme() {
        const isDarkMode = document.getElementById('themeToggle').checked;
        const root = document.documentElement;
        if (isDarkMode) {
            root.style.setProperty('--primary-color', '#4d7ea8');
            root.style.setProperty('--secondary-color', '#2c3e50');
            root.style.setProperty('--accent-color', '#e74c3c');
            root.style.setProperty('--background-color', '#f5f7fa');
            root.style.setProperty('--panel-bg', '#ffffff');
            root.style.setProperty('--text-color', '#333333');

        } else {
            root.style.setProperty('--primary-color', '#4d7ea8');
            root.style.setProperty('--secondary-color', '#ecf0f1');
            root.style.setProperty('--accent-color', '#e74c3c');
            root.style.setProperty('--background-color', '#2c3e50');
            root.style.setProperty('--panel-bg', '#34495e');
            root.style.setProperty('--text-color', '#ecf0f1');
        }
        drawCoordinatePlane();
        drawParallelogram();
    }

    // Синхронізує значення слайдера та текстового поля для масштабу
    function syncUnitLengthInputs() {
        const slider = document.getElementById('unitLength');
        const number = document.getElementById('unitLengthNumber');
        number.value = slider.value;
        settings.unitLength = parseInt(slider.value);
        drawCoordinatePlane();
        drawParallelogram();
    }
    
    // Синхронізує значення слайдера та текстового поля для кроку сітки
    function syncGridStepInputs() {
        const slider = document.getElementById('gridStep');
        const number = document.getElementById('gridStepNumber');
        number.value = slider.value;
        settings.gridStep = parseInt(slider.value);
        drawCoordinatePlane();
        drawParallelogram();
    }

   // Синхронізує значення слайдера швидкості анімації та відображає значення
    function syncAnimationSpeedInputs() {
        const slider = document.getElementById('animationSpeed');
        parallelogram.animationSpeed = parseFloat(slider.value);
        document.getElementById('animationSpeedValue').textContent = parallelogram.animationSpeed.toFixed(2);
    }



    // Перевіряє, чи утворюють точки правильний паралелограм
    function validateParallelogram(points) {
        if (points.length !== 4) {
            return false;
        }
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
                if (points[i].x === points[j].x && points[i].y === points[j].y) {
                    return false;
                }
            }
        }
        const v01 = { x: points[1].x - points[0].x, y: points[1].y - points[0].y };
        const v32 = { x: points[2].x - points[3].x, y: points[2].y - points[3].y };
        const v03 = { x: points[3].x - points[0].x, y: points[3].y - points[0].y };
        const v12 = { x: points[2].x - points[1].x, y: points[2].y - points[1].y };
        const isParallel1 = Math.abs(v01.x * v32.y - v01.y * v32.x) < 0.0001;
        const isParallel2 = Math.abs(v03.x * v12.y - v03.y * v12.x) < 0.0001;
        const isEqual1 = Math.abs(Math.sqrt(v01.x * v01.x + v01.y * v01.y) - Math.sqrt(v32.x * v32.x + v32.y * v32.y)) < 0.0001;
        const isEqual2 = Math.abs(Math.sqrt(v03.x * v03.x + v03.y * v03.y) - Math.sqrt(v12.x * v12.x + v12.y * v12.y)) < 0.0001;
        return isParallel1 && isParallel2 && isEqual1 && isEqual2;
    }

   // Малює паралелограм на координатній площині
    function drawParallelogram() {
        if (parallelogram.vertices.length !== 4) return;
        const originX = canvas.width / 2;
        const originY = canvas.height / 2;
        const scale = settings.unitLength;
        ctx.beginPath();
        const startX = originX + parallelogram.vertices[0].x * scale;
        const startY = originY - parallelogram.vertices[0].y * scale;
        ctx.moveTo(startX, startY);
        for (let i = 1; i < 4; i++) {
            const x = originX + parallelogram.vertices[i].x * scale;
            const y = originY - parallelogram.vertices[i].y * scale;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.stroke();
        const pivotX = originX + parallelogram.vertices[parallelogram.pivotVertexIndex].x * scale;
        const pivotY = originY - parallelogram.vertices[parallelogram.pivotVertexIndex].y * scale;
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < 4; i++) {
            const x = originX + parallelogram.vertices[i].x * scale;
            const y = originY - parallelogram.vertices[i].y * scale;
            ctx.fillText(`V${i+1}`, x, y - 15);
        }
    }

    // // Створює матрицю афінного перетворення для обертання та масштабування
    // function createTransformationMatrix(angle, scaleFactor, pivotX, pivotY) {
    //     const t = angle / (Math.PI * 2);
    //     const s = t < 0.5 ? 
    //         1 - (2 * t) * (1 - 1/scaleFactor) : 
    //         (1/scaleFactor) + (2 * (t - 0.5)) * (1 - 1/scaleFactor);

    //     console.log('createTransformationMatrix: A =', scaleFactor, 's =', s, 'angle =', angle.toFixed(3), 't =', t.toFixed(3));

    //     const cos = Math.cos(-angle);
    //     const sin = Math.sin(-angle);

    //     const matrix = [
    //         [s * cos, -s * sin, pivotX * (1 - s * cos) + pivotY * s * sin],
    //         [s * sin, s * cos, pivotY * (1 - s * cos) - pivotX * s * sin],
    //         [0, 0, 1]
    //     ];

    //     return matrix;
    // }

    // Створює матрицю афінного перетворення для обертання, масштабування та повернення у початковий стан
    function createTransformationMatrix(angle, scaleFactor, pivotX, pivotY) {
    const fullRotation = Math.PI * 2; // Повний оберт
    const t = angle / fullRotation; //Приводимо кут angle (у радіанах) до діапазону [0, 1] для анімації на повному оберті (360°)
    
    let s, cos, sin;
    // Перша половина анімації - обертання за годинниковою стрілкою і зменшення
    if (t < 0.5) {
        // Масштабування від 1 до 1/scaleFactor
        s = 1 - (2 * t) * (1 - 1/scaleFactor);
        // Обертання за годинниковою стрілкою
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
    } 
    // Друга половина анімації - обертання проти годинникової стрілки і повернення до початкового розміру
    else {
        // Масштабування від 1/scaleFactor назад до 1
        s = (1/scaleFactor) + (2 * (t - 0.5)) * (1 - 1/scaleFactor);
        // Обчислюємо кут повернення: від max до 0
        const returnAngle = fullRotation - angle;
        cos = Math.cos(-returnAngle);
        sin = Math.sin(-returnAngle);
    }
    //Це обчислення потрібне для того, щоб обертання і масштабування відбувалося відносно точки pivotX, pivotY, а не від (0, 0)
    const tx = pivotX * (1 - s * cos) + pivotY * s * sin;
    const ty = pivotY * (1 - s * cos) - pivotX * s * sin;

    // Створення матриці афінного перетворення  
    const matrix = [
        [s * cos, -s * sin, tx],
        [s * sin, s * cos, ty],
        [0, 0, 1]
    ];
    
    return matrix;
    }

   
    function applyTransformation(point, matrix) {
        //Перехід у гомогенні координати
        const homogeneous = [point.x, point.y, 1];
        //Множення матриці на вектор
        const transformed = [
            matrix[0][0] * homogeneous[0] + matrix[0][1] * homogeneous[1] + matrix[0][2] * homogeneous[2],
            matrix[1][0] * homogeneous[0] + matrix[1][1] * homogeneous[1] + matrix[1][2] * homogeneous[2],
            matrix[2][0] * homogeneous[0] + matrix[2][1] * homogeneous[1] + matrix[2][2] * homogeneous[2]
        ];
        return {
            x: transformed[0],
            y: transformed[1]
        };
    }

    // Animate parallelogram
    function animateParallelogram() {
        if (!parallelogram.isAnimating) return;
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        //Оновлення кута обертання
        parallelogram.rotationAngle += parallelogram.animationSpeed;
        if (parallelogram.rotationAngle >= MAX_ROTATION) {
            parallelogram.rotationAngle -= MAX_ROTATION;
        }
        
        //Задаємо точку, навколо якої буде обертання/масштабування.
        const pivotPoint = parallelogram.originalVertices[parallelogram.pivotVertexIndex];
        
        //Створення матриці трансформації
        const transformMatrix = createTransformationMatrix(
            parallelogram.rotationAngle,
            parallelogram.scaleFactorA,
            pivotPoint.x,
            pivotPoint.y
        );
        
        parallelogram.transformationMatrix = transformMatrix;
        //Застосування трансформації до вершин
        parallelogram.vertices = parallelogram.originalVertices.map((vertex, index) => {
            if (index === parallelogram.pivotVertexIndex) {
                return { x: vertex.x, y: vertex.y };
            }
            return applyTransformation(vertex, transformMatrix);
        });
        
        drawCoordinatePlane();
        drawParallelogram();
        
        animationId = requestAnimationFrame(animateParallelogram);
    }

    //Початок анімації
    function startAnimation() {
        if (parallelogram.vertices.length !== 4) {
            showMessage('Спочатку створіть паралелограм!', 'error');
            return;
        }
        //Збереження оригінальних вершин, якщо вони ще не збережені
        if (!parallelogram.isAnimating) {
            if (parallelogram.originalVertices.length === 0) {
                parallelogram.originalVertices = JSON.parse(JSON.stringify(parallelogram.vertices));
            }
            
            if (parallelogram.rotationAngle !== 0) {
                parallelogram.vertices = JSON.parse(JSON.stringify(parallelogram.originalVertices));
                parallelogram.rotationAngle = 0;
            }
            
            parallelogram.isAnimating = true;
            document.getElementById('startAnimation').textContent = 'Зупинити';
            animateParallelogram();
        } else {
            parallelogram.isAnimating = false;
            document.getElementById('startAnimation').textContent = 'Продовжити';
        }
    }

    //Скинути анімацію
    function resetAnimation() {
        if (parallelogram.isAnimating) {
            parallelogram.isAnimating = false;
            document.getElementById('startAnimation').textContent = 'Почати рух';
            cancelAnimationFrame(animationId);
        }
        
        if (parallelogram.originalVertices.length === 4) {
            parallelogram.vertices = JSON.parse(JSON.stringify(parallelogram.originalVertices));
            parallelogram.rotationAngle = 0;
            drawCoordinatePlane();
            drawParallelogram();
        }
    }

    function saveTransformationMatrix() {
        if (!parallelogram.transformationMatrix) {
            showMessage('Спочатку запустіть анімацію, щоб створити матрицю перетворень', 'error');
            return;
        }
    
        // Gather additional data
        const pivotPoint = parallelogram.originalVertices[parallelogram.pivotVertexIndex];
        const angleRadians = parallelogram.rotationAngle;
        const angleDegrees = (angleRadians * 180 / Math.PI).toFixed(2);
        const scaleFactor = parallelogram.scaleFactorA;
    
        // Format the matrix for readability
        const matrix = parallelogram.transformationMatrix;
        const formattedMatrix = [
            `[ ${matrix[0][0].toFixed(4)}  ${matrix[0][1].toFixed(4)}  ${matrix[0][2].toFixed(4)} ]`,
            `[ ${matrix[1][0].toFixed(4)}  ${matrix[1][1].toFixed(4)}  ${matrix[1][2].toFixed(4)} ]`,
            `[ ${matrix[2][0].toFixed(4)}  ${matrix[2][1].toFixed(4)}  ${matrix[2][2].toFixed(4)} ]`
        ];
    
        // Format vertices data
        const initialVertices = parallelogram.originalVertices.map((v, i) => ({
            vertex: `V${i + 1}`,
            x: v.x.toFixed(4),
            y: v.y.toFixed(4)
        }));
        const currentVertices = parallelogram.vertices.map((v, i) => ({
            vertex: `V${i + 1}`,
            x: v.x.toFixed(4),
            y: v.y.toFixed(4)
        }));
    
        // Create detailed output
        const outputData = {
            description: "Transformation Matrix for Parallelogram Animation",
            matrix: {
                formatted: formattedMatrix,
                raw: matrix
            },
            parameters: {
                rotationAngle: {
                    radians: angleRadians.toFixed(4),
                    degrees: angleDegrees
                },
                scaleFactor: scaleFactor,
                pivotPoint: {
                    x: pivotPoint.x,
                    y: pivotPoint.y,
                    vertexIndex: parallelogram.pivotVertexIndex
                }
            },
            vertices: {
                initial: initialVertices,
                current: currentVertices
            }
        };
    
        // Convert to JSON with indentation
        const matrixData = JSON.stringify(outputData, null, 2);
        const blob = new Blob([matrixData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
    
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transformation_matrix_detailed.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    
        showMessage('Детальну матрицю перетворень успішно збережено', 'success');
    }

    // Save initial parallelogram
    function saveInitialParallelogram() {
        if (parallelogram.vertices.length !== 4) {
            showMessage('Спочатку створіть паралелограм!', 'error');
            return;
        }
        
        const initialData = JSON.stringify({
            vertices: parallelogram.originalVertices.length ? 
                      parallelogram.originalVertices : 
                      parallelogram.vertices,
            pivotVertexIndex: parallelogram.pivotVertexIndex,
            scaleFactorA: parallelogram.scaleFactorA
        }, null, 2);
        
        const blob = new Blob([initialData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'initial_parallelogram.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('Початковий паралелограм успішно збережено', 'success');
    }

    // Load parallelogram
    function loadParallelogram(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.vertices && data.vertices.length === 4) {
                    if (!validateParallelogram(data.vertices)) {
                        showMessage('Завантажені дані не утворюють правильний паралелограм', 'error');
                        return;
                    }
                    
                    if (parallelogram.isAnimating) {
                        parallelogram.isAnimating = false;
                        document.getElementById('startAnimation').textContent = 'Почати рух';
                        cancelAnimationFrame(animationId);
                    }
                    
                    parallelogram.vertices = data.vertices;
                    parallelogram.originalVertices = JSON.parse(JSON.stringify(data.vertices));
                    
                    if (typeof data.pivotVertexIndex === 'number' && data.pivotVertexIndex >= 0 && data.pivotVertexIndex < 4) {
                        parallelogram.pivotVertexIndex = data.pivotVertexIndex;
                        document.getElementById('pivotVertex').value = data.pivotVertexIndex;
                    }
                    
                    if (typeof data.scaleFactorA === 'number' && data.scaleFactorA > 0) {
                        parallelogram.scaleFactorA = data.scaleFactorA;
                        document.getElementById('scaleFactor').value = data.scaleFactorA;
                    }
                    
                    parallelogram.rotationAngle = 0;
                    for (let i = 0; i < 4; i++) {
                        document.getElementById(`x${i+1}`).value = data.vertices[i].x;
                        document.getElementById(`y${i+1}`).value = data.vertices[i].y;
                    }
                    
                    drawCoordinatePlane();
                    drawParallelogram();
                    
                    showMessage('Паралелограм успішно завантажено', 'success');
                } else {
                    showMessage('Невірний формат файлу', 'error');
                }
            } catch (err) {
                showMessage('Помилка при завантаженні файлу: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Show message
    function showMessage(message, type = 'info') {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = 'message ' + type;
        messageElement.style.display = 'block';
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    // Create parallelogram
    function createParallelogram() {
        const vertices = [];
        for (let i = 1; i <= 4; i++) {
            const x = parseFloat(document.getElementById(`x${i}`).value);
            const y = parseFloat(document.getElementById(`y${i}`).value);
            if (isNaN(x) || isNaN(y)) {
                showMessage(`Введіть коректні координати для вершини V${i}`, 'error');
                return;
            }
            vertices.push({ x, y });
        }
        
        if (!validateParallelogram(vertices)) {
            showMessage('Введені точки не утворюють паралелограм. Перевірте координати!', 'error');
            return;
        }
        
        parallelogram.vertices = vertices;
        parallelogram.originalVertices = JSON.parse(JSON.stringify(vertices));
        parallelogram.pivotVertexIndex = parseInt(document.getElementById('pivotVertex').value);
        parallelogram.scaleFactorA = parseFloat(document.getElementById('scaleFactor').value);
        parallelogram.rotationAngle = 0;
        parallelogram.isAnimating = false;
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        document.getElementById('startAnimation').textContent = 'Почати рух';
        drawCoordinatePlane();
        drawParallelogram();
        showMessage('Паралелограм успішно створено', 'success');
    }

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleMouseWheel);
    document.getElementById('applySettings').addEventListener('click', applySettings);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    document.getElementById('themeToggle').addEventListener('change', toggleTheme);
    document.getElementById('unitLength').addEventListener('input', syncUnitLengthInputs);
    document.getElementById('unitLengthNumber').addEventListener('input', function() {
        document.getElementById('unitLength').value = this.value;
        settings.unitLength = parseInt(this.value);
        drawCoordinatePlane();
        drawParallelogram();
    });
    document.getElementById('gridStep').addEventListener('input', syncGridStepInputs);
    document.getElementById('gridStepNumber').addEventListener('input', function() {
        document.getElementById('gridStep').value = this.value;
        settings.gridStep = parseInt(this.value);
        drawCoordinatePlane();
        drawParallelogram();
    });
    document.getElementById('animationSpeed').addEventListener('input', syncAnimationSpeedInputs);
    document.getElementById('createParallelogram').addEventListener('click', createParallelogram);
    document.getElementById('startAnimation').addEventListener('click', startAnimation);
    document.getElementById('resetAnimation').addEventListener('click', resetAnimation);
    document.getElementById('saveMatrix').addEventListener('click', saveTransformationMatrix);
    document.getElementById('saveParallelogram').addEventListener('click', saveInitialParallelogram);
    document.getElementById('loadParallelogram').addEventListener('change', loadParallelogram);

    // Initialize
    resizeCanvas();
});