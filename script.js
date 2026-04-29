const svg = document.getElementById('network-svg');
const NS = "http://www.w3.org/2000/svg";

const CONFIG = {
    width: 1600,
    height: 1000,
    portWidth: 70,
    portHeight: 35,
    flowColors: [
        '#8b5cf6', // Purple
        '#3b82f6', // Blue
        '#06b6d4', // Cyan
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#ec4899', // Pink
        '#6366f1'  // Indigo
    ]
};

svg.setAttribute('viewBox', `0 0 ${CONFIG.width} ${CONFIG.height}`);

function createEl(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    for (const [key, val] of Object.entries(attrs)) el.setAttribute(key, val);
    return el;
}

// Markers for arrows
const defs = createEl('defs');
CONFIG.flowColors.forEach((color, i) => {
    const marker = createEl('marker', {
        id: `arrow-${i}`, viewBox: '0 0 10 10', refX: '10', refY: '5',
        markerWidth: '4', markerHeight: '4', orient: 'auto-start-reverse'
    });
    marker.appendChild(createEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: color }));
    defs.appendChild(marker);
});
svg.appendChild(defs);

const nodes = {};
const connectionCount = {};

function getPoint(nodeId, side = 'bottom') {
    const node = nodes[nodeId];
    if (!node) return { x: 0, y: 0 };
    connectionCount[nodeId] = (connectionCount[nodeId] || 0) + 1;
    const count = connectionCount[nodeId];
    const spread = (count - 1) * 8 - 15; 
    
    if (side === 'top') return { x: node.x + spread, y: node.y - node.h / 2 };
    if (side === 'bottom') return { x: node.x + spread, y: node.y + node.h / 2 };
    return { x: node.x, y: node.y };
}

// Pills - Moved to Y=60 for clean header
function drawPill(x, y, label) {
    const g = createEl('g');
    g.appendChild(createEl('rect', { x: x - 120, y: y - 30, width: 240, height: 60, rx: 30, class: 'pill-container' }));
    const t = createEl('text', { x, y: y + 5, 'text-anchor': 'middle', class: 'pill-label' });
    t.textContent = label;
    g.appendChild(t);
    svg.appendChild(g);
    nodes[label] = { x, y, w: 240, h: 60 };
}

drawPill(450, 60, 'Cybernet Network IN');
drawPill(1150, 60, 'Cybernet Network OUT');

// Headers
const headers = [
    { x: 800, y: 560, text: 'DPI SERVERS' },
    { x: 800, y: 790, text: 'MIRROR SERVERS' }
];
headers.forEach(h => {
    const t = createEl('text', { x: h.x, y: h.y, 'text-anchor': 'middle', style: 'font-family: Inter; font-weight: 800; font-size: 14px; fill: #94a3b8; letter-spacing: 2px;' });
    t.textContent = h.text;
    svg.appendChild(t);
});

// Switch Frame
svg.appendChild(createEl('rect', { x: 40, y: 220, width: 1520, height: 260, rx: 12, fill: 'none', stroke: '#3b82f6', 'stroke-width': 3 }));

function drawModule(startX, startY, moduleNum, prefix) {
    const g = createEl('g');
    g.appendChild(createEl('rect', { x: startX - 20, y: startY - 20, width: 720, height: 200, rx: 8, fill: '#fff', stroke: '#cbd5e1', 'stroke-width': 1 }));
    g.appendChild(createEl('line', { x1: startX + 350, y1: startY - 20, x2: startX + 350, y2: startY + 180, stroke: '#e2e8f0', 'stroke-width': 1 }));
    const label = createEl('text', { x: startX + 350, y: startY - 40, 'text-anchor': 'middle', style: 'font-family: Inter; font-size: 14px; fill: #475569; font-weight: 800;' });
    label.textContent = `MODULE ${moduleNum}`;
    g.appendChild(label);
    
    for (let i = 0; i < 16; i++) {
        const isEven = (i + 1) % 2 === 0;
        const pairIndex = Math.floor(i / 2);
        const row = isEven ? 1 : 0;
        const groupOffset = pairIndex >= 4 ? 20 : 0;
        const px = startX + pairIndex * 85 + groupOffset;
        const py = startY + row * 80;
        const portId = `${prefix}/${i + 1}`;
        const pg = createEl('g');
        pg.appendChild(createEl('rect', { x: px, y: py, width: CONFIG.portWidth, height: CONFIG.portHeight, rx: 2, fill: '#fff', stroke: '#475569', 'stroke-width': 1 }));
        const pt = createEl('text', { x: px + CONFIG.portWidth/2, y: py + 22, class: 'port-label' });
        pt.textContent = portId;
        pg.appendChild(pt);
        g.appendChild(pg);
        nodes[portId] = { x: px + CONFIG.portWidth/2, y: py + CONFIG.portHeight/2, w: CONFIG.portWidth, h: CONFIG.portHeight };
    }
    svg.appendChild(g);
}

drawModule(80, 260, 1, '0');
drawModule(800, 260, 2, '2');

function drawServer(s) {
    const isMirror = s.label.includes('MIRROR');
    const g = createEl('g');
    g.appendChild(createEl('rect', { x: s.x - 90, y: s.y - 45, width: 180, height: 90, rx: 8, fill: isMirror ? '#fffcf0' : '#fff', stroke: isMirror ? '#fd7e14' : '#cbd5e1', 'stroke-width': 1.5 }));
    const iconG = createEl('g', { transform: `translate(${s.x - 15}, ${s.y - 35})` });
    iconG.appendChild(createEl('rect', { x: 0, y: 0, width: 30, height: 18, rx: 2, fill: '#cbd5e1', stroke: '#475569', 'stroke-width': 1 }));
    iconG.appendChild(createEl('line', { x1: 5, y1: 9, x2: 25, y2: 9, stroke: '#475569', 'stroke-width': 2 }));
    g.appendChild(iconG);
    const t = createEl('text', { x: s.x, y: s.y + 25, 'text-anchor': 'middle', class: 'server-label', style: 'font-family: JetBrains Mono; font-size: 14px; font-weight: 700;' });
    t.textContent = s.label;
    g.appendChild(t);
    svg.appendChild(g);
    nodes[s.id] = { x: s.x, y: s.y, w: 180, h: 90 };
}

const serverList = [
    { id: 'DPI9', x: 300, y: 660, label: 'DPI-9' },
    { id: 'DPI10', x: 550, y: 660, label: 'DPI-10' },
    { id: 'DPI11', x: 1050, y: 660, label: 'DPI-11' },
    { id: 'DPI12', x: 1300, y: 660, label: 'DPI-12' },
    { id: 'MIR1', x: 300, y: 880, label: 'MIRROR DPI-1' },
    { id: 'MIR2', x: 550, y: 880, label: 'MIRROR DPI-2' },
    { id: 'MIR3', x: 1050, y: 880, label: 'MIRROR DPI-3' },
    { id: 'MIR4', x: 1300, y: 880, label: 'MIRROR DPI-4' }
];
serverList.forEach(drawServer);

function drawLine(from, to, colorIndex, style = 'solid', label = null) {
    const fromNode = nodes[from];
    const toNode = nodes[to];
    
    const isPortToPort = from.includes('/') && to.includes('/');
    const isToOUT = to === 'Cybernet Network OUT';
    const isFromIN = from === 'Cybernet Network IN';
    const isToServer = to.startsWith('DPI') || to.startsWith('MIR');
    const isFromServer = from.startsWith('DPI');

    let fromSide = 'bottom', toSide = 'top';

    if (isPortToPort || isToOUT) {
        fromSide = 'top';
        toSide = 'top';
    } else if (isFromServer) {
        fromSide = 'top';
        toSide = 'bottom';
    } else if (isToServer || isFromIN) {
        fromSide = 'bottom';
        toSide = 'top';
    }

    const start = getPoint(from, fromSide);
    const end = getPoint(to, toSide);
    const color = CONFIG.flowColors[colorIndex];
    
    const path = createEl('path', { class: 'connection-line', stroke: color, 'marker-end': `url(#arrow-${colorIndex})`, 'stroke-dasharray': style === 'dashed' ? '6 4' : '0' });
    
    let d;
    if (isToOUT) {
        // High Arc that stays BELOW Cybernet Pills (Y=60) but CLEAR of other lines
        const arc = Math.min(Math.abs(end.x - start.x) * 0.2, 100);
        d = `M ${start.x} ${start.y} C ${start.x} ${start.y - arc}, ${end.x} ${start.y - arc}, ${end.x} ${end.y}`;
    } else if (isPortToPort) {
        // TIGHTER Arcs within the module area
        const arc = Math.min(Math.abs(end.x - start.x) * 0.35, 60);
        d = `M ${start.x} ${start.y} C ${start.x} ${start.y - arc}, ${end.x} ${start.y - arc}, ${end.x} ${end.y}`;
    } else {
        const midY = (start.y + end.y) / 2;
        d = `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
    }
    path.setAttribute('d', d);
    svg.appendChild(path);

    if (label) {
        const midX = (start.x + end.x) / 2;
        const midY = isToOUT ? start.y - 70 : (start.y + end.y) / 2 - 10;
        const t = createEl('text', { x: midX, y: midY, 'text-anchor': 'middle', style: `font-size: 10px; fill: ${color}; font-weight: 800; text-transform: uppercase;` });
        t.textContent = label;
        svg.appendChild(t);
    }
}

// M1
drawLine('Cybernet Network IN', '0/9', 0, 'solid', 'IN');
drawLine('0/9', '0/7', 0, 'dashed');
drawLine('0/9', '0/8', 0, 'dashed');
drawLine('0/7', 'DPI9', 0, 'dashed');
drawLine('DPI9', '0/7', 0, 'dashed');
drawLine('0/7', '0/11', 0, 'dashed');
drawLine('0/11', 'Cybernet Network OUT', 0, 'dashed', 'OUT');
drawLine('0/10', 'MIR1', 0, 'dashed', 'Mirror');

drawLine('Cybernet Network IN', '0/11', 1, 'solid', 'IN');
drawLine('0/11', '0/5', 1, 'dashed');
drawLine('0/11', '0/6', 1, 'dashed');
drawLine('0/5', 'DPI9', 1, 'dashed');
drawLine('DPI9', '0/5', 1, 'dashed');
drawLine('0/5', '0/9', 1, 'dashed');
drawLine('0/9', 'Cybernet Network OUT', 1, 'dashed', 'OUT');
drawLine('0/12', 'MIR1', 1, 'dashed', 'Mirror');

drawLine('Cybernet Network IN', '0/13', 2, 'solid', 'IN');
drawLine('0/13', '0/3', 2, 'dashed');
drawLine('0/13', '0/6', 2, 'dashed');
drawLine('0/3', 'DPI10', 2, 'dashed');
drawLine('DPI10', '0/3', 2, 'dashed');
drawLine('0/3', '0/15', 2, 'dashed');
drawLine('0/15', 'Cybernet Network OUT', 2, 'dashed', 'OUT');
drawLine('0/14', 'MIR2', 2, 'dashed', 'Mirror');

drawLine('Cybernet Network IN', '0/15', 3, 'solid', 'IN');
drawLine('0/15', '0/1', 3, 'dashed');
drawLine('0/15', '0/8', 3, 'dashed');
drawLine('0/1', 'DPI10', 3, 'dashed');
drawLine('DPI10', '0/1', 3, 'dashed');
drawLine('0/1', '0/13', 3, 'dashed');
drawLine('0/13', 'Cybernet Network OUT', 3, 'dashed', 'OUT');
drawLine('0/16', 'MIR2', 3, 'dashed', 'Mirror');

// M2
drawLine('Cybernet Network IN', '2/9', 4, 'solid', 'IN');
drawLine('2/9', '2/1', 4, 'dashed');
drawLine('2/1', 'DPI11', 4, 'dashed');
drawLine('DPI11', '2/1', 4, 'dashed');
drawLine('2/1', '2/11', 4, 'dashed');
drawLine('2/11', 'Cybernet Network OUT', 4, 'dashed', 'OUT');
drawLine('2/10', 'MIR3', 4, 'dashed', 'Mirror');

drawLine('Cybernet Network IN', '2/11', 5, 'solid', 'IN');
drawLine('2/11', '2/3', 5, 'dashed');
drawLine('2/3', 'DPI11', 5, 'dashed');
drawLine('DPI11', '2/3', 5, 'dashed');
drawLine('2/3', '2/9', 5, 'dashed');
drawLine('2/9', 'Cybernet Network OUT', 5, 'dashed', 'OUT');
drawLine('2/12', 'MIR3', 5, 'dashed', 'Mirror');

drawLine('Cybernet Network IN', '2/13', 6, 'solid', 'IN');
drawLine('2/13', '2/5', 6, 'dashed');
drawLine('2/5', 'DPI12', 6, 'dashed');
drawLine('DPI12', '2/5', 6, 'dashed');
drawLine('2/5', '2/15', 6, 'dashed');
drawLine('2/15', 'Cybernet Network OUT', 6, 'dashed', 'OUT');
drawLine('2/14', 'MIR4', 6, 'dashed', 'Mirror');

drawLine('Cybernet Network IN', '2/15', 7, 'solid', 'IN');
drawLine('2/15', '2/7', 7, 'dashed');
drawLine('2/7', 'DPI12', 7, 'dashed');
drawLine('DPI12', '2/7', 7, 'dashed');
drawLine('2/7', '2/13', 7, 'dashed');
drawLine('2/13', 'Cybernet Network OUT', 7, 'dashed', 'OUT');
drawLine('2/16', 'MIR4', 7, 'dashed', 'Mirror');

document.getElementById('download-png').addEventListener('click', () => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 4;
    canvas.width = CONFIG.width * scale;
    canvas.height = CONFIG.height * scale;
    img.onload = () => {
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale); ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'niagara-switch-13-compact.png';
        link.href = canvas.toDataURL('image/png'); link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
});
