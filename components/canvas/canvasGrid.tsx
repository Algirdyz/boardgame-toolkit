import * as fabric from 'fabric';

const drawGrid = (canvas: fabric.Canvas, pixelsPerCm: number) => {
    const width = canvas.getWidth();
    const height = canvas.getHeight();
    const zoom = canvas.getZoom();

    const lines = [];
    // Add vertical lines
    for (let i = 0; i < width / pixelsPerCm; i++) {
        lines.push(new fabric.Line([i * pixelsPerCm, 0, i * pixelsPerCm, height], {
            stroke: '#ccc',
            strokeWidth: 1 / zoom,
            selectable: false,
            evented: false,
            objectCaching: false
        }));
    }

    // Add horizontal lines
    for (let i = 0; i < height / pixelsPerCm; i++) {
        lines.push(new fabric.Line([0, i * pixelsPerCm, width, i * pixelsPerCm], {
            strokeWidth: 1 / zoom,
            stroke: '#ccc',
            selectable: false,
            evented: false,
            objectCaching: false
        }));
    }
    const gridGroup = new fabric.Group(lines, {
        selectable: false,
        evented: false,
    });
    canvas.add(gridGroup);
    canvas.sendObjectToBack(gridGroup);
};

export default drawGrid;