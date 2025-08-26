import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { getShape } from '../../lib/shapes';
import { Box } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { createName } from '../../components/templateCanvas/components/Name';
import { createResourceList } from '../../components/templateCanvas/components/ResourceList';
import { createWorkerSlots } from '../../components/templateCanvas/components/WorkerSlots';
import { TemplateDefinition, WorkerTemplate } from '@/app/lib/templateTypes';

interface TemplateCanvasProps {
    template: TemplateDefinition;
}


const TemplateCanvas = ({ template }: TemplateCanvasProps) => {
    const { type, workerDefinition } = template;

    const workerGroup = useRef<fabric.Group | null>(null);
    const canvasHtmlRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const { ref, width, height } = useElementSize();

    const updateWorkerDefinition = (newDef: WorkerTemplate) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let x = 0;
        let y = 0;
        if (workerGroup.current) {
            x = workerGroup.current.left || 0;
            y = workerGroup.current.top || 0;
            canvas.remove(workerGroup.current);
            workerGroup.current = null;
        }
        if (newDef) {
            const workerSlots = createWorkerSlots(newDef, width, height);
            workerSlots.set({ left: x, top: y });
            workerGroup.current = workerSlots;
            if (workerSlots) {
                canvas.add(workerSlots);
            }
        }
    };


    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.setDimensions({ width, height });
            canvas.requestRenderAll();
        }
    }, [width, height]);

    useEffect(() => {
        if (!canvasHtmlRef.current) {
            return;
        }
        canvasRef.current = new fabric.Canvas(canvasHtmlRef.current, {
            width,
            height,
            backgroundColor: '#f0f0f0'
        });

        // Clean up on unmount
        return () => {
            if (canvasRef.current) {
                canvasRef.current.dispose();
                canvasRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        updateWorkerDefinition(workerDefinition);

    }, [workerDefinition]);

    useEffect(() => {
        if (!canvasRef.current || !type) {
            return;
        }

        const canvas = canvasRef.current;
        canvas.clear();

        // Add template shape
        const shape = getShape(type, 'lightgrey');
        shape.set({
            left: 50,
            top: 50,
            selectable: false,
            evented: false,
        });
        canvas.add(shape);

        // Add draggable components
        const nameText = createName();
        const resourceList = createResourceList();

        canvas.add(nameText, resourceList);

        if (workerDefinition) {
            updateWorkerDefinition(workerDefinition);
        }

        canvas.renderAll();

    }, [type, width, height]);


    return (
        <Box ref={ref} p={0} m={0} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasHtmlRef} />
        </Box>
    );
};

export default TemplateCanvas;
