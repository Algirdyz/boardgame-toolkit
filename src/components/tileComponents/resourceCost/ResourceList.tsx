import { ResourceListTemplate } from '@/components/lib/templateTypes';
import * as fabric from 'fabric';
import { useRef } from 'react';

const createResourceIcon = (color: string, amount: number, shapeType: 'circle' | 'rect') => {
    let shape;
    const shapeSize = 20;

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
        fontWeight: 'bold',
        fontFamily: 'Lato',
    });

    return new fabric.Group([shape, text]);
};

export const useResourceListDef = (canvas: fabric.Canvas | null, onDefChange: (nameDef: ResourceListTemplate) => void) => {
    const resourceListGroup = useRef<fabric.Group | null>(null);

    const updateResourceListDefinition = (_width: number, _height: number, newDef?: ResourceListTemplate) => {
        if (!canvas) return;

        let x = newDef?.position.x || 0;
        let y = newDef?.position.y || 0;
        if (resourceListGroup.current) {
            x = resourceListGroup.current.left || x;
            y = resourceListGroup.current.top || y;
            canvas.remove(resourceListGroup.current);
            resourceListGroup.current = null;
        }

        if (newDef) {
            const { resources, spacing } = newDef;
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
                left: x,
                top: y,
                cornerColor: 'green',
                cornerSize: 6,
                transparentCorners: false,
                subTargetCheck: true,
                lockScalingX: true,
                lockScalingY: true,
            });

            group.on('modified', () => {
                console.log('ResourceList moved to:', group.left, group.top);
                onDefChange({ ...newDef, position: { x: group.left || 0, y: group.top || 0 } });
            });

            resourceListGroup.current = group;
            canvas.add(group);
        }
    };

    return {
        resourceListGroup,
        updateResourceListDefinition,
    };
};
