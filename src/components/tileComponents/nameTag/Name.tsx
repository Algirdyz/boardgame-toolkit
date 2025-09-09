import type { NameTemplate } from '@/components/lib/templateTypes';
import * as fabric from 'fabric';
import { useRef } from 'react';

const createName = (def: NameTemplate, onDefChange: (def: NameTemplate) => void) => {
    const nameText = new fabric.Textbox('Name', {
        left: 300,
        top: 50,
        width: def.maxWidth || 150,
        fontSize: 20,
        textAlign: 'center',
        backgroundColor: 'lightblue',
        rx: 10,
        ry: 10,
        borderColor: 'blue',
        cornerColor: 'blue',
        cornerSize: 6,
        transparentCorners: false,
        lockScalingY: true,
        snapAngle: 90,
        editable: false,
        fontFamily: 'Lato',
    });

    nameText.on('modified', () => {
        console.log('Name modified:', nameText.text, nameText.width, nameText.left, nameText.top);
        onDefChange({ ...def, maxWidth: nameText.width, position: { x: nameText.left || 0, y: nameText.top || 0 } });
    });
    return nameText;
};

export const useNameDef = (canvas: fabric.Canvas | null, onDefChange: (nameDef: NameTemplate) => void) => {
    const nameGroup = useRef<fabric.Textbox | null>(null);

    const updateNameDefinition = (_width: number, _height: number, nameDef: NameTemplate) => {
        if (!canvas) return;
        const x = nameDef.position.x || 0;
        const y = nameDef.position.y || 0;
        if (nameGroup.current && nameDef) {
            nameGroup.current.left = x;
            nameGroup.current.top = y;
            nameGroup.current.set('width', nameDef.maxWidth || 150);

        } else if (nameDef) {
            const nameText = createName(nameDef, onDefChange);
            nameText.set({ left: x, top: y });
            nameGroup.current = nameText;
            canvas.add(nameText);
            canvas.bringObjectToFront(nameText);

        } else if (nameGroup.current) {
            canvas.remove(nameGroup.current);
            nameGroup.current = null;
        }
    };

    return {
        updateNameDefinition,
    }
}