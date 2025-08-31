import { getDPI } from '@/app/lib/dpi';
import drawGrid from '@/components/canvas/canvasGrid';
import { PIXELS_PER_CM } from '@/components/lib/constants';
import { TemplateDefinition } from '@/components/lib/templateTypes';
import { Box, SegmentedControl } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import * as fabric from 'fabric';
import { useEffect, useRef, useState } from 'react';
import { getShape } from '../../../components/lib/shapes';
import { useNameDef } from '../../../components/templateCanvas/components/Name';
import { useResourceListDef } from '../../../components/templateCanvas/components/ResourceList';
import { useWorkerDef } from '../../../components/templateCanvas/components/WorkerSlots';

interface TemplateCanvasProps {
    template: TemplateDefinition;
}

const TemplateCanvas = ({ template }: TemplateCanvasProps) => {
    const { type, workerDefinition, nameDefinition, resourceListDefinition } = template;
    const [viewMode, setViewMode] = useState('fit');
    const [pixelsPerCm, setPixelsPerCm] = useState(PIXELS_PER_CM);

    const canvasHtmlRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<fabric.Canvas | null>(null);

    const workerGroup = useWorkerDef(canvasRef.current);
    const name = useNameDef(canvasRef.current);
    const resourceList = useResourceListDef(canvasRef.current);
    const { ref, width, height } = useElementSize();

    useEffect(() => {
        const dpi = getDPI();
        console.log(dpi);
        setPixelsPerCm(dpi / 2.54);
    }, []);

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
        workerGroup.updateWorkerDefinition(width, height, workerDefinition);

    }, [workerDefinition]);

    useEffect(() => {
        if (!canvasRef.current || !type) {
            return;
        }

        const canvas = canvasRef.current;
        canvas.clear();
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // Reset zoom and pan


        // Add template shape
        const shape = getShape(type, 'white');
        shape.set({
            left: pixelsPerCm,
            top: pixelsPerCm,
            selectable: false,
            evented: false,
        });
        canvas.add(shape);

        if (resourceListDefinition) {
            resourceList.updateResourceListDefinition(width, height, resourceListDefinition);
        }

        if (nameDefinition) {
            name.updateNameDefinition(width, height, nameDefinition);
        }

        if (workerDefinition) {
            workerGroup.updateWorkerDefinition(width, height, workerDefinition);
        }

        if (viewMode === 'fit') {
            const padding = 50;
            const shapeBounds = shape.getBoundingRect();
            const scaleX = (width - padding * 2) / shapeBounds.width;
            const scaleY = (height - padding * 2) / shapeBounds.height;
            const zoom = Math.min(scaleX, scaleY);

            const shapeCenter = shape.getCenterPoint();
            const panX = (width / 2) - (shapeCenter.x * zoom);
            const panY = (height / 2) - (shapeCenter.y * zoom);
            canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
        }
        drawGrid(canvas, pixelsPerCm);

        canvas.renderAll();

    }, [type, width, height, viewMode, pixelsPerCm, workerDefinition, nameDefinition, resourceListDefinition]);


    return (
        <Box ref={ref} p={0} m={0} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <SegmentedControl
                value={viewMode}
                onChange={setViewMode}
                data={[
                    { label: 'Fit to View', value: 'fit' },
                    { label: 'Actual Size', value: 'actual' },
                ]}
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
            />
            <canvas ref={canvasHtmlRef} />
        </Box>
    );
};

export default TemplateCanvas;
