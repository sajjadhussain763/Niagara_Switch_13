const svg = document.getElementById('network-svg');
const NS = "http://www.w3.org/2000/svg";

const CONFIG = {
    width: 1400,
    height: 800,
    portSize: 40,
    modulePadding: 60,
    serverWidth: 140,
    serverHeight: 60,
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
        refX: '8',
        refY: '5',
        markerWidth: '4',
        markerHeight: '4',
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

function addNode(id, x, y, type, label) {
    nodes[id] = { x, y, type, label };
}

// Layout Configuration
const m1X = 100;
const m2X = 800;
const moduleY = 200;
const serverY = 500;
const mirrorY = 700;

// Draw Modules
function drawModule(startX, startY, moduleNum, prefix) {
    const group = createEl('g', { class: 'module-group' });
    const rect = createEl('rect', {
        x: startX - 20,
        y: startY - 40,
        width: 500,
        height: 180,
        class: 'module-group'
    });
    const header = createEl('text', {
        x: startX + 230,
        y: startY - 50,
        class: 'module-header',
        'text-anchor': 'middle'
    });
    header.textContent = `MODULE ${moduleNum}`;
    
    group.appendChild(rect);
    group.appendChild(header);

    // Ports Grid: 2 rows of 8
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const portId = `${prefix}/${i + 1}`;
        const px = startX + col * 60;
        const py = startY + row * 80;
        
        const portG = createEl('g', { class: 'port-node' });
        const portRect = createEl('rect', {
            x: px,
            y: py,
            width: CONFIG.portSize,
            height: CONFIG.portSize,
            class: 'port-box',
            id: `port-${portId.replace('/', '-')}`
        });
        const portLabel = createEl('text', {
            x: px + CONFIG.portSize / 2,
            y: py + CONFIG.portSize / 2 + 5,
            class: 'port-label'
        });
        portLabel.textContent = portId;
        
        portG.appendChild(portRect);
        portG.appendChild(portLabel);
        group.appendChild(portG);
        
        // Save port coordinates (center)
        nodes[portId] = { x: px + CONFIG.portSize / 2, y: py + CONFIG.portSize / 2 };
    }
    svg.appendChild(group);
}

drawModule(m1X, moduleY, 1, '0');
drawModule(m2X, moduleY, 2, '2');

// Draw Servers
const serverConfigs = [
    { id: 'DPI9', x: 200, y: serverY, label: 'DPI Server 9' },
    { id: 'DPI10', x: 450, y: serverY, label: 'DPI Server 10' },
    { id: 'DPA11', x: 850, y: serverY, label: 'DPA Server 11' },
    { id: 'DPA12', x: 1100, y: serverY, label: 'DPA Server 12' },
    { id: 'MIR1', x: 200, y: mirrorY, label: 'Mirror Server' },
    { id: 'MIR2', x: 450, y: mirrorY, label: 'Mirror Server 2' },
    { id: 'MIR3', x: 850, y: mirrorY, label: 'Mirror Server 3' },
    { id: 'MIR4', x: 1100, y: mirrorY, label: 'Mirror Server 4' }
];

serverConfigs.forEach(s => {
    const g = createEl('g', { class: 'server-node' });
    const r = createEl('rect', {
        x: s.x - CONFIG.serverWidth / 2,
        y: s.y - CONFIG.serverHeight / 2,
        width: CONFIG.serverWidth,
        height: CONFIG.serverHeight,
        rx: 6
    });
    const t = createEl('text', {
        x: s.x,
        y: s.y + 5,
        class: 'server-label'
    });
    t.textContent = s.label;
    g.appendChild(r);
    g.appendChild(t);
    svg.appendChild(g);
    nodes[s.id] = { x: s.x, y: s.y };
});

// Network Sources
addNode('CYBER', 700, 50, 'source', 'Cybernet');
const cyberCloud = createEl('path', {
    d: 'M650,60 Q650,30 680,30 Q690,10 720,20 Q750,10 760,40 Q790,40 790,70 Q790,100 760,100 L640,100 Q610,100 610,70 Q610,40 640,50',
    class: 'network-cloud'
});
const cyberText = createEl('text', { x: 700, y: 70, 'text-anchor': 'middle', class: 'server-label' });
cyberText.textContent = 'Cybernet';
// svg.appendChild(cyberCloud);
// svg.appendChild(cyberText);

// Function to draw curved lines
function drawLine(from, to, type, label = '', bidirectional = false) {
    const start = nodes[from];
    const end = nodes[to];
    if (!start || !end) return;

    // Adjust start/end to touch boxes
    let sx = start.x;
    let sy = start.y;
    let ex = end.x;
    let ey = end.y;

    // Simple offset logic to avoid overlapping lines
    const dx = ex - sx;
    const dy = ey - sy;
    
    const path = createEl('path', {
        class: `connection-line flow-${type}`,
        'marker-end': `url(#arrow-${type})`
    });

    // Control point for curve
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;
    const curveAmount = Math.abs(dx) > 100 ? 50 : 20;
    
    // Create a smooth cubic bezier
    let d;
    if (Math.abs(dy) < 50) {
        // Horizontal-ish
        d = `M ${sx} ${sy} C ${sx + dx/4} ${sy - curveAmount}, ${ex - dx/4} ${ey - curveAmount}, ${ex} ${ey}`;
    } else {
        // Vertical-ish
        d = `M ${sx} ${sy} C ${sx} ${sy + dy/2}, ${ex} ${sy + dy/2}, ${ex} ${ey}`;
    }
    
    path.setAttribute('d', d);
    svg.appendChild(path);

    if (bidirectional) {
        const revPath = createEl('path', {
            class: `connection-line flow-${type}`,
            'marker-end': `url(#arrow-${type})`,
            d: `M ${ex} ${ey} C ${ex} ${sy + dy/2 + 10}, ${sx} ${sy + dy/2 + 10}, ${sx} ${sy}`
        });
        svg.appendChild(revPath);
    }

    if (label) {
        const textPath = createEl('text', { class: 'line-label' });
        const textNode = createEl('textPath', {
            'href': `#path-${from}-${to}`, // would need unique IDs
            'startOffset': '50%',
            'text-anchor': 'middle'
        });
        // Simplification: Place text at midpoint
        const labelText = createEl('text', {
            x: midX,
            y: midY - 10,
            class: 'line-label',
            'text-anchor': 'middle'
        });
        labelText.textContent = label;
        svg.appendChild(labelText);
    }
}

// --- MODULE 1 FLOWS (Blue) ---
// Flow 1: Cable to 0/9 -> 0/7, 0/8
drawLine('CYBER', '0/9', 'm1', '0/9');
drawLine('0/9', '0/7', 'm1');
drawLine('0/9', '0/8', 'm1');
// 0/7 <-> DPI 9
drawLine('0/7', 'DPI9', 'm1', '0/7 to DPI Server 9', true);
// 0/7 -> 0/11
drawLine('0/7', '0/11', 'm1');
// 0/10 -> Mirror (Orange)
drawLine('0/10', 'MIR1', 'mirror', '0/10 to Mirror Server');

// Flow 2: Cable to 0/11 -> 0/5, 0/6
drawLine('CYBER', '0/11', 'm1', '0/11');
drawLine('0/11', '0/5', 'm1');
drawLine('0/11', '0/6', 'm1');
// 0/5 <-> DPI 9
drawLine('0/5', 'DPI9', 'm1', '0/5 to DPI Server 9', true);
// 0/5 -> 0/9
drawLine('0/5', '0/9', 'm1');
// 0/12 -> Mirror (Orange)
drawLine('0/12', 'MIR1', 'mirror', '0/12 to Mirror Server');

// Flow 3: Cable to 0/13 -> 0/3, 0/6
drawLine('CYBER', '0/13', 'm1', '0/13');
drawLine('0/13', '0/3', 'm1');
drawLine('0/13', '0/6', 'm1');
// 0/3 <-> DPI 10
drawLine('0/3', 'DPI10', 'm1', '0/3 to DPI Server 10', true);
// 0/3 -> 0/15
drawLine('0/3', '0/15', 'm1');
// 0/14 -> Mirror 2 (Orange)
drawLine('0/14', 'MIR2', 'mirror', '0/14 to Mirror Server 2');

// Flow 4: Cable to 0/15 -> 0/1, 0/8
drawLine('CYBER', '0/15', 'm1', '0/15');
drawLine('0/15', '0/1', 'm1');
drawLine('0/15', '0/8', 'm1');
// 0/1 <-> DPI 10
drawLine('0/1', 'DPI10', 'm1', '0/1 to DPI Server 10', true);
// 0/1 -> 0/13
drawLine('0/1', '0/13', 'm1');
// 0/16 -> Mirror 2 (Orange)
drawLine('0/16', 'MIR2', 'mirror', '0/16 to Mirror Server 2');

// --- MODULE 2 FLOWS (Green) ---
// Flow 1: Cybernet -> 2/9 -> 2/1
drawLine('CYBER', '2/9', 'm2', '2/9');
drawLine('2/9', '2/1', 'm2');
// 2/1 <-> DPA 11
drawLine('2/1', 'DPA11', 'm2', '2/1 to DPA Server 11', true);
// 2/1 -> 2/11
drawLine('2/1', '2/11', 'm2');
// 2/10 -> Mirror (Orange)
drawLine('2/10', 'MIR1', 'mirror', '2/10 to Mirror Server');

// Flow 2: Cybernet -> 2/11 -> 2/3
drawLine('CYBER', '2/11', 'm2', '2/11');
drawLine('2/11', '2/3', 'm2');
// 2/3 <-> DPA 11
drawLine('2/3', 'DPA11', 'm2', '2/3 to DPA Server 11', true);
// 2/3 -> 2/9
drawLine('2/3', '2/9', 'm2');
// 2/12 -> Mirror 3 (Orange)
drawLine('2/12', 'MIR3', 'mirror', '2/12 to Mirror Server 3');

// Flow 3: Cybernet -> 2/13 -> 2/5
drawLine('CYBER', '2/13', 'm2', '2/13');
drawLine('2/13', '2/5', 'm2');
// 2/5 <-> DPA 12
drawLine('2/5', 'DPA12', 'm2', '2/5 to DPA Server 12', true);
// 2/5 -> 2/15
drawLine('2/5', '2/15', 'm2');
// 2/14 -> Mirror 4 (Orange)
drawLine('2/14', 'MIR4', 'mirror', '2/14 to Mirror Server 4');

// Flow 4: Cybernet -> 2/15 -> 2/7
drawLine('CYBER', '2/15', 'm2', '2/15');
drawLine('2/15', '2/7', 'm2');
// 2/7 <-> DPA 12
drawLine('2/7', 'DPA12', 'm2', '2/7 to DPA Server 12', true);
// 2/7 -> 2/13
drawLine('2/7', '2/13', 'm2');
// 2/16 -> Mirror 4 (Orange)
drawLine('2/16', 'MIR4', 'mirror', '2/16 to Mirror Server 4');


// Export functionality
document.getElementById('download-png').addEventListener('click', () => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Scale for 8K
    const scale = 4; 
    canvas.width = CONFIG.width * scale;
    canvas.height = CONFIG.height * scale;
    
    img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'niagara-network-diagram.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
});
