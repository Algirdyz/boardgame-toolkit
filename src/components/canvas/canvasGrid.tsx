import * as fabric from 'fabric';

const drawGrid = (canvas: fabric.Canvas, pixelsPerCm: number) => {
    const lastGrid = canvas.getObjects().find(obj => obj.id === 'grid');
    if (lastGrid) {
        canvas.remove(lastGrid);
    }
    const width = canvas.getWidth();
    const height = canvas.getHeight();
    const zoom = canvas.getZoom();

    const color = '#dbdbdbff';

    const lines = [];
    // Add vertical lines
    for (let i = 0; i < width / pixelsPerCm; i++) {
        lines.push(new fabric.Line([i * pixelsPerCm, 0, i * pixelsPerCm, height], {
            stroke: color,
            strokeWidth: 2 / zoom,
            selectable: false,
            evented: false,
            objectCaching: false,
        }));
    }

    // Add horizontal lines
    for (let i = 0; i < height / pixelsPerCm; i++) {
        lines.push(new fabric.Line([0, i * pixelsPerCm, width, i * pixelsPerCm], {
            strokeWidth: 2 / zoom,
            stroke: color,
            selectable: false,
            evented: false,
            objectCaching: false
        }));
    }
    const gridGroup = new fabric.Group(lines, {
        id: 'grid',
        selectable: false,
        evented: false,
        objectCaching: false

    });
    canvas.add(gridGroup);
    canvas.sendObjectToBack(gridGroup);
};

export default drawGrid;