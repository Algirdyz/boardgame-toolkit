import { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';
import { Box, Button } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { loadTileSet } from '../lib/io';
import { Tile } from '../lib/types';
import { getShape } from '../lib/shapes';

const TileCanvas = ({ tileId }: { tileId: string | null }) => {
    const canvasHtmlRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<Canvas | null>(null);
    const { ref, width, height } = useElementSize();
    const [tile, setTile] = useState<Tile | null>(null);

    useEffect(() => {
        const fetchTile = async () => {
            if (!tileId) {
                setTile(null);
                if (canvasRef.current) {
                    canvasRef.current.clear();
                    canvasRef.current.requestRenderAll();
                }
                return;
            }
            const tileSet = await loadTileSet('default');
            const currentTile = tileSet?.tiles.find(t => t.id === tileId) || null;
            setTile(currentTile);
        };
        fetchTile();
    }, [tileId]);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.setDimensions({ width, height });
            canvas.clear();
            if (tile) {
                const shape = getShape(tile.shape, tile.factionColor || 'red');
                canvas.add(shape);
                canvas.centerObject(shape);
            }
            canvas.requestRenderAll();
        }
    }, [width, height, tile]);


    useEffect(() => {
        const canvasEl = canvasHtmlRef.current;
        if (!canvasEl) return;

        if (!canvasRef.current) {
            canvasRef.current = new Canvas(canvasEl, {
                selection: false,
                width,
                height,
            });
        }

        return () => {
            canvasRef.current?.dispose();
            canvasRef.current = null;
        };
    }, [width, height]);

    const handleExportSVG = () => {
        const canvas = canvasRef.current;
        if (!canvas || !tile) return;

        const svg = canvas.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tile.name.replace(/\s/g, '_')}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <Box ref={ref} p={0} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasHtmlRef} />
            {tile && (
                <Button
                    onClick={handleExportSVG}
                    style={{ position: 'absolute', top: 10, right: 10 }}
                >
                    Export to SVG
                </Button>
            )}
        </Box>
    )
};

export default TileCanvas;
