// Initialize Chart.js
const ctx = document.getElementById('graphCanvas').getContext('2d');
let chart;
let functions = [];
let datasets = [];
let shiftActive = false;

// Initialize the chart
function initChart() {
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    min: parseFloat(document.getElementById('xMin').value),
                    max: parseFloat(document.getElementById('xMax').value),
                    grid: {
                        color: document.getElementById('gridColor').value
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    min: parseFloat(document.getElementById('yMin').value),
                    max: parseFloat(document.getElementById('yMax').value),
                    grid: {
                        color: document.getElementById('gridColor').value
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.1
                },
                point: {
                    radius: 3
                }
            }
        }
    });
}

// Tab functionality
function openTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Add a function to the graph
function addFunction() {
    const funcInput = document.getElementById('functionInput').value.trim();
    const color = document.getElementById('functionColor').value;
    
    if (!funcInput) {
        alert('Please enter a function');
        return;
    }
    
    try {
        // Test if the function is valid
        const testExpr = funcInput.replace(/x/g, '1');
        math.evaluate(testExpr);
    } catch (e) {
        alert('Invalid function: ' + e.message);
        return;
    }
    
    const funcId = 'func-' + Date.now();
    functions.push({
        id: funcId,
        expression: funcInput,
        color: color
    });
    
    // Add to UI list
    const funcItem = document.createElement('div');
    funcItem.className = 'function-item';
    funcItem.id = funcId + '-item';
    funcItem.innerHTML = `
        <div class="function-color" style="background-color: ${color};"></div>
        <div style="flex-grow: 1;">y = ${funcInput}</div>
        <button onclick="removeFunction('${funcId}')">×</button>
    `;
    document.getElementById('functionList').appendChild(funcItem);
    
    // Update the graph
    updateFunctionGraphs();
}

// Remove a function
function removeFunction(funcId) {
    functions = functions.filter(f => f.id !== funcId);
    document.getElementById(funcId + '-item').remove();
    updateFunctionGraphs();
}

// Update all function graphs
function updateFunctionGraphs() {
    // Remove all function datasets
    datasets = datasets.filter(ds => !ds.isFunction);
    
    // Add new function datasets
    functions.forEach(func => {
        const points = [];
        const xMin = parseFloat(document.getElementById('xMin').value);
        const xMax = parseFloat(document.getElementById('xMax').value);
        const step = (xMax - xMin) / 500; // 500 points for smooth curve
        
        for (let x = xMin; x <= xMax; x += step) {
            try {
                const y = math.evaluate(func.expression, { x: x });
                if (typeof y === 'number' && isFinite(y)) {
                    points.push({ x: x, y: y });
                }
            } catch (e) {
                console.error('Error evaluating function:', e);
            }
        }
        
        datasets.push({
            label: 'y = ' + func.expression,
            data: points,
            borderColor: func.color,
            backgroundColor: func.color,
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            isFunction: true
        });
    });
    
    updateChart();
}

// Add data points
function addDataPoints() {
    const dataInput = document.getElementById('dataInput').value.trim();
    const color = document.getElementById('dataColor').value;
    
    if (!dataInput) {
        alert('Please enter some data points');
        return;
    }
    
    const points = [];
    const lines = dataInput.split('\n');
    
    for (const line of lines) {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length === 2) {
            const x = parseFloat(parts[0]);
            const y = parseFloat(parts[1]);
            if (!isNaN(x) && !isNaN(y)) {
                points.push({ x: x, y: y });
            }
        }
    }
    
    if (points.length === 0) {
        alert('No valid data points found');
        return;
    }
    
    datasets.push({
        label: 'Data Points',
        data: points,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        pointRadius: 5,
        showLine: false,
        isFunction: false
    });
    
    updateChart();
}

// Update graph settings
function updateGraphSettings() {
    chart.options.scales.x.min = parseFloat(document.getElementById('xMin').value);
    chart.options.scales.x.max = parseFloat(document.getElementById('xMax').value);
    chart.options.scales.y.min = parseFloat(document.getElementById('yMin').value);
    chart.options.scales.y.max = parseFloat(document.getElementById('yMax').value);
    chart.options.scales.x.grid.color = document.getElementById('gridColor').value;
    chart.options.scales.y.grid.color = document.getElementById('gridColor').value;
    
    chart.update();
    updateFunctionGraphs(); // Recalculate functions with new ranges
}

// Update the chart with current datasets
function updateChart() {
    chart.data.datasets = datasets;
    chart.update();
}

// Clear all graphs
function clearAll() {
    functions = [];
    datasets = [];
    document.getElementById('functionList').innerHTML = '';
    document.getElementById('dataInput').value = '';
    updateChart();
}

// Export as image
function exportAsImage() {
    const link = document.createElement('a');
    link.download = 'graph.png';
    link.href = document.getElementById('graphCanvas').toDataURL('image/png');
    link.click();
}

// Calculator helper functions
function toggleCalculatorHelper() {
    const helper = document.getElementById('calculatorHelper');
    helper.classList.toggle('active');
}

function insertSymbol(symbol) {
    const input = document.getElementById('functionInput');
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    const currentValue = input.value;
    
    // Insert the symbol at the cursor position
    input.value = currentValue.substring(0, startPos) + symbol + currentValue.substring(endPos);
    
    // Move cursor to after the inserted symbol
    input.selectionStart = input.selectionEnd = startPos + symbol.length;
    
    // Focus back on the input
    input.focus();
}

function toggleShift() {
    shiftActive = !shiftActive;
    const shiftButton = document.getElementById('shiftButton');
    const advancedFunctions = document.getElementById('advancedFunctions');
    
    if (shiftActive) {
        shiftButton.classList.add('shift-active');
        advancedFunctions.classList.add('active');
    } else {
        shiftButton.classList.remove('shift-active');
        advancedFunctions.classList.remove('active');
    }
}

// Splash screen functions
function openSplash() {
    document.getElementById('splashScreen').style.display = 'flex';
}

function closeSplash() {
    document.getElementById('splashScreen').style.display = 'none';
}

// Close calculator helper when clicking outside
document.addEventListener('click', function(event) {
    const helper = document.getElementById('calculatorHelper');
    const input = document.getElementById('functionInput');
    
    if (!helper.contains(event.target) && event.target !== input) {
        helper.classList.remove('active');
    }
});

// Close splash when clicking outside content
document.getElementById('splashScreen').addEventListener('click', function(e) {
    if (e.target === this) {
        closeSplash();
    }
});

// Initialize when page loads
window.onload = function() {
    initChart();
    // Add a default function
    addFunction();
};