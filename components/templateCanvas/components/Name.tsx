import type { NameTemplate } from '@/components/lib/templateTypes';
import * as fabric from 'fabric';
import { useRef } from 'react';

export const createName = () => {
    const nameText = new fabric.Textbox('Name', {
        left: 300,
        top: 50,
        width: 150,
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
        fontFamily: 'Lato',
    });
    return nameText;
};

export const useNameDef = (canvas: fabric.Canvas | null) => {
    const nameGroup = useRef<fabric.Textbox | null>(null);

    const updateNameDefinition = (_width: number, _height: number, nameDef: NameTemplate) => {
        if (!canvas) return;

        let x = nameDef.position.x || 0;
        let y = nameDef.position.y || 0;
        if (nameGroup.current) {
            x = nameGroup.current.left || x;
            y = nameGroup.current.top || y;
            canvas.remove(nameGroup.current);
            nameGroup.current = null;
        }
        if (nameDef) {
            const nameText = createName();
            nameText.set({ left: x, top: y });
            nameGroup.current = nameText;
            if (nameText) {
                canvas.add(nameText);
            }
        }
    };

    return {
        updateNameDefinition,
    }
}