import * as fabric from 'fabric';

const createResourceIcon = (color: string, amount: number, shapeType: 'circle' | 'rect') => {
    let shape;
    const shapeSize = 30;

    if (shapeType === 'circle') {
        shape = new fabric.Circle({
            radius: shapeSize / 2,
            fill: color,
            originX: 'center',
            originY: 'center',
        });
    } else { // rect
        shape = new fabric.Rect({
            width: shapeSize,
            height: shapeSize,
            fill: color,
            originX: 'center',
            originY: 'center',
        });
    }

    const text = new fabric.Textbox(amount.toString(), {
        fontSize: 14,
        fill: 'white',
        originX: 'center',
        originY: 'center',
        fontWeight: 'bold'
    });

    return new fabric.Group([shape, text]);
};

export const createResourceList = () => {
    const resources = [
        { color: '#8B4513', amount: 1, shape: 'circle' as const }, // Wood
        { color: 'gray', amount: 2, shape: 'rect' as const },      // Stone
        { color: 'orange', amount: 5, shape: 'circle' as const }     // Gold
    ];

    const spacing = 10;
    const icons = resources.map((res) => {
        return createResourceIcon(res.color, res.amount, res.shape);
    });

    // Position icons horizontally
    let currentWidth = 0;
    for (const icon of icons) {
        icon.left = currentWidth;
        currentWidth += (icon.width || 0) + spacing;
    }

    const group = new fabric.Group(icons, {
        left: 300,
        top: 120,
        cornerColor: 'green',
        cornerSize: 6,
        transparentCorners: false,
        subTargetCheck: true,
    });

    return group;
};
