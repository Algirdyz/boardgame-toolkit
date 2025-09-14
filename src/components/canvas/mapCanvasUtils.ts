import { CellType, MapCell } from '@shared/maps';
import * as fabric from 'fabric';
import { hoverColor } from '@/lib/constants';

export type TileCoord = { x: number; y: number };

/**
 * Create an interactive cell with clickable area and visual fill
 */
export function createInteractiveCell(
  tileCoord: TileCoord,
  squareTileShape: any,
  startX: number,
  startY: number
): fabric.Group {
  const vertices = squareTileShape.getAllVertices(tileCoord);
  const fabricPoints = vertices.map((v: any) => new fabric.Point(v.x + startX, v.y + startY));

  // Create invisible clickable area
  const clickArea = new fabric.Polygon(fabricPoints, {
    fill: 'rgba(0,0,0,0)',
    stroke: 'rgba(0,0,0,0)',
    selectable: false,
    evented: true,
    hoverCursor: 'pointer',
    objectCaching: false,
  });

  // Create visual cell fill
  const cellFill = new fabric.Polygon(fabricPoints, {
    fill: 'rgba(0,0,0,0)',
    stroke: 'rgba(0,0,0,0)',
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  // Group the clickable area and fill
  const group = new fabric.Group([cellFill, clickArea], {
    selectable: false,
    evented: true,
    hoverCursor: 'pointer',
    objectCaching: false,
  });

  // Store reference to the fill and coordinates for updating
  (group as any).cellFill = cellFill;
  (group as any).cellCoord = tileCoord;

  return group;
}

/**
 * Update the visual appearance of a cell
 */
export function updateCellVisual(
  group: fabric.Group,
  cellType: CellType | null,
  getCellTypeColor: (cellType: CellType) => string
) {
  const cellFill = (group as any).cellFill;
  if (cellType) {
    const color = getCellTypeColor(cellType);
    cellFill.set({
      fill: color,
      opacity: 0.7,
    });
  } else {
    cellFill.set({
      fill: 'rgba(0,0,0,0)',
      opacity: 0,
    });
  }
}

/**
 * Setup hover effects for an interactive cell
 */
export function setupCellHoverEffects(
  group: fabric.Group,
  canvas: fabric.Canvas,
  functionsRef: React.RefObject<{
    getCellByCoord: (x: number, y: number) => MapCell | undefined;
    getActiveCellType: () => CellType | null;
    getCellTypeColor: (cellType: CellType) => string;
    getCellTypeById: (id: string) => CellType | undefined;
    handleCellClick: (x: number, y: number) => void;
  }>
) {
  const tileCoord = (group as any).cellCoord as TileCoord;
  const cellFill = (group as any).cellFill;

  group.on('mouseover', () => {
    if (!functionsRef.current) return;
    const currentCell = functionsRef.current.getCellByCoord(tileCoord.x, tileCoord.y);
    const activeCellType = functionsRef.current.getActiveCellType();

    if (!currentCell && activeCellType) {
      // Show preview of what would be painted
      const previewColor = functionsRef.current.getCellTypeColor(activeCellType);
      cellFill.set({
        fill: previewColor,
        opacity: 0.3,
      });
    } else if (!currentCell) {
      // Show hover effect for empty cell
      cellFill.set({
        fill: hoverColor,
        opacity: 0.2,
      });
    }
    canvas.renderAll();
  });

  group.on('mouseout', () => {
    if (!functionsRef.current) return;
    const currentCell = functionsRef.current.getCellByCoord(tileCoord.x, tileCoord.y);

    if (currentCell) {
      // Restore original cell type color
      const cellType = functionsRef.current.getCellTypeById(currentCell.cellTypeId || '');
      updateCellVisual(group, cellType || null, functionsRef.current.getCellTypeColor);
    } else {
      // Clear hover effect
      cellFill.set({
        fill: 'rgba(0,0,0,0)',
        opacity: 0,
      });
    }
    canvas.renderAll();
  });

  group.on('mousedown', () => {
    functionsRef.current.handleCellClick(tileCoord.x, tileCoord.y);
  });
}

/**
 * Create a grid line between two points
 */
export function createGridLine(x1: number, y1: number, x2: number, y2: number): fabric.Line {
  return new fabric.Line([x1, y1, x2, y2], {
    stroke: '#ccc',
    strokeWidth: 1,
    selectable: false,
    evented: false,
  });
}
