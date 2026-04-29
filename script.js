const svg = document.getElementById('network-svg');
const NS = "http://www.w3.org/2000/svg";

const CONFIG = {
    width: 1600,
    height: 900,
    portSize: 32,
    modulePadding: 80,
    serverWidth: 120,
    serverHeight: 40,
    colors: {
        m1: '#0066cc',
        m2: '#28a745',
        mirror: '#fd7e14'
    }
};

svg.setAttribute('viewBox', `0 0 ${CONFIG.width} ${CONFIG.height}`);

// Helper to create SVG elements
function createEl(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    for (const [key, val] of Object.entries(attrs)) {
        el.setAttribute(key, val);
    }
    return el;
}

// Markers for arrows
const defs = createEl('defs');
['m1', 'm2', 'mirror'].forEach(type => {
    const marker = createEl('marker', {
        id: `arrow-${type}`,
        viewBox: '0 0 10 10',
        refX: '9',
        refY: '5',
        markerWidth: '5',
        markerHeight: '5',
        orient: 'auto-start-reverse'
    });
    const path = createEl('path', {
        d: 'M 0 0 L 10 5 L 0 10 z',
        fill: CONFIG.colors[type]
    });
    marker.appendChild(path);
    defs.appendChild(marker);
});
svg.appendChild(defs);

const nodes = {};

// Draw Pills for Cybernet
function drawPill(x, y, label) {
    const g = createEl('g');
    const r = createEl('rect', {
        x: x - 100,
        y: y - 25,
        width: 200,
        height: 50,
        rx: 25,
        class: 'network-pill'
    });
    const t = createEl('text', {
        x: x,
        y: y + 5,
        'text-anchor': 'middle',
        class: 'server-label'
    });
    t.textContent = label;
    g.appendChild(r);
    g.appendChild(t);
    svg.appendChild(g);
    nodes[label] = { x, y };
}

drawPill(400, 80, 'Cybernet Network IN');
drawPill(1200, 80, 'Cybernet Network OUT');

// Draw Modules
function drawModule(startX, startY, moduleNum, prefix) {
    const group = createEl('g');
    const rect = createEl('rect', {
        x: startX - 20,
        y: startY - 30,
        width: 580,
        height: 120,
        fill: '#f8f9fa',
        stroke: '#dee2e6',
        'stroke-width': 1,
        rx: 10
    });
    const header = createEl('text', {
        x: startX + 270,
        y: startY - 40,
        class: 'module-header',
        'text-anchor': 'middle',
        'font-size': '12px',
        'font-weight': '700',
        fill: '#6c757d'
    });
    header.textContent = `MODULE ${moduleNum}`;
    
    group.appendChild(rect);
    group.appendChild(header);

    // Ports Grid: 2 rows of 8
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const portId = `${prefix}/${i + 1}`;
        const px = startX + col * 70;
        const py = startY + row * 45;
        
        const portG = createEl('g', { class: 'port-node' });
        const portRect = createEl('rect', {
            x: px,
            y: py,
            width: CONFIG.portSize,
            height: CONFIG.portSize,
            class: 'port-box',
            id: `port-${portId.replace('/', '-')}`,
            fill: 'white',
            stroke: '#333',
            'stroke-width': '1.5'
        });
        const portLabel = createEl('text', {
            x: px + CONFIG.portSize / 2,
            y: py + CONFIG.portSize / 2 + 4,
            'font-family': 'JetBrains Mono',
            'font-size': '10px',
            'font-weight': '700',
            'text-anchor': 'middle'
        });
        portLabel.textContent = portId;
        
        portG.appendChild(portRect);
        portG.appendChild(portLabel);
        group.appendChild(portG);
        
        // Save port coordinates
        nodes[portId] = { 
            x: px + CONFIG.portSize / 2, 
            y: py + CONFIG.portSize / 2,
            top: { x: px + CONFIG.portSize / 2, y: py },
            bottom: { x: px + CONFIG.portSize / 2, y: py + CONFIG.portSize },
            left: { x: px, y: py + CONFIG.portSize / 2 },
            right: { x: px + CONFIG.portSize, y: py + CONFIG.portSize / 2 }
        };
    }
    svg.appendChild(group);
}

drawModule(150, 250, 1, '0');
drawModule(870, 250, 2, '2');

// Draw Servers
const serverConfigs = [
    { id: 'DPI9', x: 300, y: 550, label: 'DPI Server 9' },
    { id: 'DPI10', x: 500, y: 550, label: 'DPI Server 10' },
    { id: 'DPA11', x: 1000, y: 550, label: 'DPA Server 11' },
    { id: 'DPA12', x: 1250, y: 550, label: 'DPA Server 12' },
    { id: 'MIR1', x: 300, y: 750, label: 'Mirror Server' },
    { id: 'MIR2', x: 500, y: 750, label: 'Mirror Server 2' },
    { id: 'MIR3', x: 1000, y: 750, label: 'Mirror Server 3' },
    { id: 'MIR4', x: 1250, y: 750, label: 'Mirror Server 4' }
];

serverConfigs.forEach(s => {
    const g = createEl('g', { class: 'server-node' });
    const r = createEl('rect', {
        x: s.x - CONFIG.serverWidth / 2,
        y: s.y - CONFIG.serverHeight / 2,
        width: CONFIG.serverWidth,
        height: CONFIG.serverHeight,
        fill: 'white',
        stroke: '#adb5bd',
        'stroke-width': '1.5',
        rx: 4
    });
    const t = createEl('text', {
        x: s.x,
        y: s.y + 5,
        class: 'server-label',
        'font-size': '12px',
        'font-weight': '700',
        'text-anchor': 'middle'
    });
    t.textContent = s.label;
    g.appendChild(r);
    g.appendChild(t);
    svg.appendChild(g);
    nodes[s.id] = { 
        x: s.x, 
        y: s.y,
        top: { x: s.x, y: s.y - CONFIG.serverHeight / 2 },
        bottom: { x: s.x, y: s.y + CONFIG.serverHeight / 2 }
    };
});

// Improved Line Drawing
function drawLine(from, to, type, label = '', bidirectional = false, fromSide = 'bottom', toSide = 'top') {
    const startNode = nodes[from];
    const endNode = nodes[to];
    if (!startNode || !endNode) return;

    const start = startNode[fromSide] || startNode;
    const end = endNode[toSide] || endNode;

    const path = createEl('path', {
        class: `connection-line`,
        stroke: CONFIG.colors[type],
        'marker-end': `url(#arrow-${type})`,
        'stroke-dasharray': type === 'mirror' ? '0' : '0' // All solid for now
    });

    const midY = (start.y + end.y) / 2;
    const d = `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
    
    path.setAttribute('d', d);
    svg.appendChild(path);

    if (bidirectional) {
        const revPath = createEl('path', {
            class: `connection-line`,
            stroke: CONFIG.colors[type],
            'marker-end': `url(#arrow-${type})`,
            d: `M ${end.x + 10} ${end.y} C ${end.x + 10} ${midY + 10}, ${start.x + 10} ${midY + 10}, ${start.x + 10} ${start.y}`
        });
        svg.appendChild(revPath);
    }

    if (label) {
        const midX = (start.x + end.x) / 2;
        const midYActual = (start.y + end.y) / 2;
        const labelGroup = createEl('g');
        const text = createEl('text', {
            x: midX,
            y: midYActual,
            'text-anchor': 'middle',
            'font-size': '9px',
            'font-weight': '600',
            fill: '#444'
        });
        text.textContent = label;
        // Background for text
        const bbox = { width: label.length * 5, height: 12 };
        const rect = createEl('rect', {
            x: midX - bbox.width / 2,
            y: midYActual - 9,
            width: bbox.width,
            height: bbox.height,
            fill: 'white',
            opacity: 0.8
        });
        labelGroup.appendChild(rect);
        labelGroup.appendChild(text);
        svg.appendChild(labelGroup);
    }
}

// --- MODULE 1 FLOWS (Blue) ---
// Flow 1
drawLine('Cybernet Network IN', '0/9', 'm1', '0/9', false, 'bottom', 'top');
drawLine('0/9', '0/7', 'm1', '', false, 'bottom', 'bottom');
drawLine('0/9', '0/8', 'm1', '', false, 'bottom', 'bottom');
drawLine('0/7', 'DPI9', 'm1', '0/7 to DPI Server 9', true, 'bottom', 'top');
drawLine('0/7', '0/11', 'm1', '0/7 to 0/11', false, 'bottom', 'bottom');
drawLine('0/10', 'MIR1', 'mirror', '0/10 to Mirror Server', false, 'bottom', 'top');

// Flow 2
drawLine('Cybernet Network IN', '0/11', 'm1', '0/11', false, 'bottom', 'top');
drawLine('0/11', '0/5', 'm1', '', false, 'bottom', 'bottom');
drawLine('0/11', '0/6', 'm1', '', false, 'bottom', 'bottom');
drawLine('0/5', 'DPI9', 'm1', '0/5 to DPI Server 9', true, 'bottom', 'top');
drawLine('0/5', '0/9', 'm1', '0/5 to 0/9', false, 'bottom', 'bottom');
drawLine('0/12', 'MIR1', 'mirror', '0/12 to Mirror Server', false, 'bottom', 'top');

// Flow 3
drawLine('Cybernet Network IN', '0/13', 'm1', '0/13', false, 'bottom', 'top');
drawLine('0/13', '0/3', 'm1', '', false, 'bottom', 'bottom');
drawLine('0/13', '0/6', 'm1', '', false, 'bottom', 'bottom');
drawLine('0/3', 'DPI10', 'm1', '0/3 to DPI Server 10', true, 'bottom', 'top');
drawLine('0/3', '0/15', 'm1', '0/3 to 0/15', false, 'bottom', 'bottom');
drawLine('0/14', 'MIR2', 'mirror', '0/14 to Mirror Server 2', false, 'bottom', 'top');

// Flow 4
drawLine('Cybernet Network IN', '0/15', 'm1', '0/15', false, 'bottom', 'top');
drawLine('0/15', '0/1', 'm1', '', false, 'bottom', 'bottom');
drawLine('0/15', '0/8', 'm1', '', false, 'bottom', 'bottom');
drawLine('0/1 hide', 'DPI10', 'm1', '0/1 to DPI Server 10', true, 'bottom', 'top'); // Fixed ID
drawLine('0/1', 'DPI10', 'm1', '0/1 to DPI Server 10', true, 'bottom', 'top');
drawLine('0/1', '0/13', 'm1', '0/1 to 0/13', false, 'bottom', 'bottom');
drawLine('0/16', 'MIR2', 'mirror', '0/16 to Mirror Server 2', false, 'bottom', 'top');

// --- MODULE 2 FLOWS (Green) ---
// Flow 1
drawLine('Cybernet Network OUT', '2/9', 'm2', '2/9', false, 'bottom', 'top');
drawLine('2/9', '2/1', 'm2', '2/9 to 2/1', false, 'bottom', 'bottom');
drawLine('2/1', 'DPA11', 'm2', '2/1 to DPA Server 11', true, 'bottom', 'top');
drawLine('2/1', '2/11', 'm2', '2/1 to 2/11', false, 'bottom', 'bottom');
drawLine('2/10', 'MIR1', 'mirror', '2/10 to Mirror Server', false, 'bottom', 'top');

// Flow 2
drawLine('Cybernet Network OUT', '2/11', 'm2', '2/11', false, 'bottom', 'top');
drawLine('2/11', '2/3', 'm2', '2/11 to 2/3', false, 'bottom', 'bottom');
drawLine('2/3', 'DPA11', 'm2', '2/3 to DPA Server 11', true, 'bottom', 'top');
drawLine('2/3', '2/9', 'm2', '2/3 to 2/9', false, 'bottom', 'bottom');
drawLine('2/12', 'MIR3', 'mirror', '2/12 to Mirror Server 3', false, 'bottom', 'top');

// Flow 3
drawLine('Cybernet Network OUT', '2/13', 'm2', '2/13', false, 'bottom', 'top');
drawLine('2/13', '2/5', 'm2', '2/13 to 2/5', false, 'bottom', 'bottom');
drawLine('2/5', 'DPA12', 'm2', '2/5 to DPA Server 12', true, 'bottom', 'top');
drawLine('2/5', '2/15', 'm2', '2/5 to 2/15', false, 'bottom', 'bottom');
drawLine('2/14', 'MIR4', 'mirror', '2/14 to Mirror Server 4', false, 'bottom', 'top');

// Flow 4
drawLine('Cybernet Network OUT', '2/15', 'm2', '2/15', false, 'bottom', 'top');
drawLine('2/15', '2/7', 'm2', '2/15 to 2/7', false, 'bottom', 'bottom');
drawLine('2/7', 'DPA12', 'm2', '2/7 to DPA Server 12', true, 'bottom', 'top');
drawLine('2/7', '2/13', 'm2', '2/7 to 2/13', false, 'bottom', 'bottom');
drawLine('2/16', 'MIR4', 'mirror', '2/16 to Mirror Server 4', false, 'bottom', 'top');


// Export functionality
document.getElementById('download-png').addEventListener('click', () => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const scale = 4; // 8K target
    canvas.width = CONFIG.width * scale;
    canvas.height = CONFIG.height * scale;
    
    img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'niagara-switch-13.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
});
