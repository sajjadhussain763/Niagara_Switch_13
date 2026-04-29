const svg = document.getElementById('network-svg');
const NS = "http://www.w3.org/2000/svg";

const CONFIG = {
    width: 1600,
    height: 900,
    portSize: 44,
    colors: {
        m1: '#0066cc',   // Blue
        m2: '#28a745',   // Green
        mirror: '#fd7e14' // Orange
    }
};

svg.setAttribute('viewBox', `0 0 ${CONFIG.width} ${CONFIG.height}`);

function createEl(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    for (const [key, val] of Object.entries(attrs)) el.setAttribute(key, val);
    return el;
}

// Markers for arrows
const defs = createEl('defs');
Object.entries(CONFIG.colors).forEach(([name, color]) => {
    const marker = createEl('marker', {
        id: `arrow-${name}`, viewBox: '0 0 10 10', refX: '10', refY: '5',
        markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse'
    });
    marker.appendChild(createEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: color }));
    defs.appendChild(marker);
});
svg.appendChild(defs);

const nodes = {};
const connectionCount = {}; // Track how many lines connect to a node to apply offsets

// Helper to get coordinates with offset
function getPoint(nodeId, side = 'bottom') {
    const node = nodes[nodeId];
    if (!node) return { x: 0, y: 0 };
    
    connectionCount[nodeId] = (connectionCount[nodeId] || 0) + 1;
    const count = connectionCount[nodeId];
    const offset = (count - 1) * 6 - 15; // Shift lines horizontally or vertically
    
    if (side === 'top') return { x: node.x + offset, y: node.y - node.h / 2 };
    if (side === 'bottom') return { x: node.x + offset, y: node.y + node.h / 2 };
    if (side === 'left') return { x: node.x - node.w / 2, y: node.y + offset };
    if (side === 'right') return { x: node.x + node.w / 2, y: node.y + offset };
    return { x: node.x, y: node.y };
}

// Draw UI Components
function drawPill(x, y, label) {
    const g = createEl('g');
    g.appendChild(createEl('rect', { x: x - 120, y: y - 30, width: 240, height: 60, class: 'pill-container' }));
    const t = createEl('text', { x, y: y + 5, 'text-anchor': 'middle', class: 'pill-label' });
    t.textContent = label;
    g.appendChild(t);
    svg.appendChild(g);
    nodes[label] = { x, y, w: 240, h: 60 };
}

drawPill(400, 100, 'Cybernet Network IN');
drawPill(1200, 100, 'Cybernet Network OUT');

// Draw Switch Frame
const switchG = createEl('g');
switchG.appendChild(createEl('rect', { x: 50, y: 220, width: 1500, height: 180, class: 'module-box' }));
svg.appendChild(switchG);

function drawModule(startX, startY, moduleNum, prefix) {
    const g = createEl('g');
    g.appendChild(createEl('rect', { x: startX - 20, y: startY - 20, width: 680, height: 120, class: 'module-inner-box' }));
    const label = createEl('text', { x: startX + 320, y: startY - 30, 'text-anchor': 'middle', class: 'server-label', style: 'font-size: 14px; fill: #64748b' });
    label.textContent = `MODULE ${moduleNum}`;
    g.appendChild(label);
    
    for (let i = 0; i < 16; i++) {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const px = startX + col * 85;
        const py = startY + row * 60;
        const portId = `${prefix}/${i + 1}`;
        
        const pg = createEl('g');
        pg.appendChild(createEl('rect', { x: px, y: py, width: CONFIG.portSize, height: CONFIG.portSize, class: 'port-rect' }));
        const pt = createEl('text', { x: px + 22, y: py + 26, class: 'port-label' });
        pt.textContent = portId;
        pg.appendChild(pt);
        g.appendChild(pg);
        nodes[portId] = { x: px + 22, y: py + 22, w: CONFIG.portSize, h: CONFIG.portSize };
    }
    svg.appendChild(g);
}

drawModule(100, 260, 1, '0');
drawModule(820, 260, 2, '2');

// Draw Servers
const servers = [
    { id: 'DPI9', x: 300, y: 550, label: 'DPI SERVER 9' },
    { id: 'DPI10', x: 550, y: 550, label: 'DPI SERVER 10' },
    { id: 'DPA11', x: 1050, y: 550, label: 'DPA SERVER 11' },
    { id: 'DPA12', x: 1300, y: 550, label: 'DPA SERVER 12' },
    { id: 'MIR1', x: 300, y: 780, label: 'MIRROR SERVER' },
    { id: 'MIR2', x: 550, y: 780, label: 'MIRROR SERVER 2' },
    { id: 'MIR3', x: 1050, y: 780, label: 'MIRROR SERVER 3' },
    { id: 'MIR4', x: 1300, y: 780, label: 'MIRROR SERVER 4' }
];

servers.forEach(s => {
    const g = createEl('g');
    g.appendChild(createEl('rect', { x: s.x - 90, y: s.y - 30, width: 180, height: 60, class: 'server-rect' }));
    const t = createEl('text', { x: s.x, y: s.y + 7, 'text-anchor': 'middle', class: 'server-label' });
    t.textContent = s.label;
    g.appendChild(t);
    svg.appendChild(g);
    nodes[s.id] = { x: s.x, y: s.y, w: 180, h: 60 };
});

// Smart Line Drawing
function drawLine(from, to, type, labelText = '', bidirectional = false, fromSide = 'bottom', toSide = 'top') {
    const start = getPoint(from, fromSide);
    const end = getPoint(to, toSide);
    const color = CONFIG.colors[type];
    
    const path = createEl('path', {
        class: 'connection-line', stroke: color, 'marker-end': `url(#arrow-${type})`
    });
    
    // Calculate control points for smooth "Smart Designer" curves
    const midY = (start.y + end.y) / 2;
    const cp1y = start.y + (end.y - start.y) * 0.4;
    const cp2y = start.y + (end.y - start.y) * 0.6;
    
    const d = `M ${start.x} ${start.y} C ${start.x} ${cp1y}, ${end.x} ${cp2y}, ${end.x} ${end.y}`;
    path.setAttribute('d', d);
    svg.appendChild(path);

    if (bidirectional) {
        const rPath = createEl('path', {
            class: 'connection-line', stroke: color, 'marker-end': `url(#arrow-${type})`,
            d: `M ${end.x + 8} ${end.y} C ${end.x + 8} ${cp2y + 8}, ${start.x + 8} ${cp1y + 8}, ${start.x + 8} ${start.y}`
        });
        svg.appendChild(rPath);
    }

    if (labelText) {
        const lx = (start.x + end.x) / 2;
        const ly = (start.y + end.y) / 2 - 10;
        const tg = createEl('g');
        const txt = createEl('text', { x: lx, y: ly, 'text-anchor': 'middle', class: 'line-label' });
        txt.textContent = labelText;
        const bg = createEl('rect', { x: lx - 40, y: ly - 10, width: 80, height: 14, fill: 'white', opacity: 0.9 });
        tg.appendChild(bg); tg.appendChild(txt);
        svg.appendChild(tg);
    }
}

// --- MODULE 1 (BLUE) ---
// Flow 1
drawLine('Cybernet Network IN', '0/9', 'm1', '0/9');
drawLine('0/9', '0/7', 'm1', '', false, 'bottom', 'top'); // Changed logic to follow prompt: "Lines from Port 0/9 to Port 0/7 and Port 0/8"
drawLine('0/9', '0/8', 'm1', '');
drawLine('0/7', 'DPI9', 'm1', '0/7 to DPI Server 9', true);
drawLine('0/7', '0/11', 'm1', '0/7 to 0/11');
drawLine('0/10', 'MIR1', 'mirror', '0/10 to Mirror Server');

// Flow 2
drawLine('Cybernet Network IN', '0/11', 'm1', '0/11');
drawLine('0/11', '0/5', 'm1', '');
drawLine('0/11', '0/6', 'm1', '');
drawLine('0/5', 'DPI9', 'm1', '0/5 to DPI Server 9', true);
drawLine('0/5', '0/9', 'm1', '0/5 to 0/9');
drawLine('0/12', 'MIR1', 'mirror', '0/12 to Mirror Server');

// Flow 3
drawLine('Cybernet Network IN', '0/13', 'm1', '0/13');
drawLine('0/13', '0/3', 'm1', '');
drawLine('0/13', '0/6', 'm1', '');
drawLine('0/3', 'DPI10', 'm1', '0/3 to DPI Server 10', true);
drawLine('0/3', '0/15', 'm1', '0/3 to 0/15');
drawLine('0/14', 'MIR2', 'mirror', '0/14 to Mirror Server 2');

// Flow 4
drawLine('Cybernet Network IN', '0/15', 'm1', '0/15');
drawLine('0/15', '0/1', 'm1', '');
drawLine('0/15', '0/8', 'm1', '');
drawLine('0/1', 'DPI10', 'm1', '0/1 to DPI Server 10', true);
drawLine('0/1', '0/13', 'm1', '0/1 to 0/13');
drawLine('0/16', 'MIR2', 'mirror', '0/16 to Mirror Server 2');

// --- MODULE 2 (GREEN) ---
// Flow 1
drawLine('Cybernet Network OUT', '2/9', 'm2', '2/9');
drawLine('2/9', '2/1', 'm2', '2/9 to 2/1');
drawLine('2/1', 'DPA11', 'm2', '2/1 to DPA Server 11', true);
drawLine('2/1', '2/11', 'm2', '2/1 to 2/11');
drawLine('2/10', 'MIR1', 'mirror', '2/10 to Mirror Server');

// Flow 2
drawLine('Cybernet Network OUT', '2/11', 'm2', '2/11');
drawLine('2/11', '2/3', 'm2', '2/11 to 2/3');
drawLine('2/3', 'DPA11', 'm2', '2/3 to DPA Server 11', true);
drawLine('2/3', '2/9', 'm2', '2/3 to 2/9');
drawLine('2/12', 'MIR3', 'mirror', '2/12 to Mirror Server 3');

// Flow 3
drawLine('Cybernet Network OUT', '2/13', 'm2', '2/13');
drawLine('2/13', '2/5', 'm2', '2/13 to 2/5');
drawLine('2/5', 'DPA12', 'm2', '2/5 to DPA Server 12', true);
drawLine('2/5', '2/15', 'm2', '2/5 to 2/15');
drawLine('2/14', 'MIR4', 'mirror', '2/14 to Mirror Server 4');

// Flow 4
drawLine('Cybernet Network OUT', '2/15', 'm2', '2/15');
drawLine('2/15', '2/7', 'm2', '2/15 to 2/7');
drawLine('2/7', 'DPA12', 'm2', '2/7 to DPA Server 12', true);
drawLine('2/7', '2/13', 'm2', '2/7 to 2/13');
drawLine('2/16', 'MIR4', 'mirror', '2/16 to Mirror Server 4');

// Export 8K
document.getElementById('download-png').addEventListener('click', () => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 4; // 8K Target
    canvas.width = CONFIG.width * scale;
    canvas.height = CONFIG.height * scale;
    img.onload = () => {
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale); ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'niagara-switch-13-8k.png';
        link.href = canvas.toDataURL('image/png'); link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
});
