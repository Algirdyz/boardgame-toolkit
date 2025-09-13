import { GridPosition } from '@shared/templates';
import { BaseTileShape } from './tileSets/baseTileShape';

type PolygonVertex = { x: number; y: number };

function encodeCoordinate(point: PolygonVertex): string {
  return `${point.x},${point.y}`;
}

function decodeCoordinate(encoded: string): PolygonVertex {
  const [x, y] = encoded.split(',').map(Number);
  return { x, y };
}

function findOuterEdge(gridCoordinates: GridPosition[]): GridPosition {
  let rightMostTile: GridPosition | null = gridCoordinates[0];
  for (const coord of gridCoordinates) {
    if (rightMostTile === null || coord.x < rightMostTile.x) {
      rightMostTile = coord;
    }
  }
  return rightMostTile;
}

function encodeVisited(current: GridPosition, direction: number): string {
  return `${current.x},${current.y},${direction}`;
}

function followLeftHandSide(
  tiles: Map<string, GridPosition>,
  pathedVertices: string[],
  start: GridPosition,
  direction: number,
  shaper: BaseTileShape,
  visited = new Set<string>()
) {
  const current = start;
  let facingDirection = direction;
  // console.log('At tile', current, 'facing', facingDirection, 'visitsed:', visited);

  let dir = shaper.turnAround(facingDirection);
  for (let i = 0; i < shaper.edgeCount; i++) {
    // if (visited.has(checkVisitKey)) return;
    dir = shaper.turnRight(dir);
    const checkVisitKey = encodeVisited(current, dir);
    if (visited.has(checkVisitKey)) {
      return;
    }
    const tile = shaper.getAdjacentTileCoordinatesEncoded(current, dir);
    // console.log('  Checking direction', dir, 'for tile', tile);
    if (tiles.has(tile)) {
      facingDirection = dir;
      break;
    } else {
      const edgeVertices = shaper.getVertexCoordinatesForEdge(current, dir);
      const encodedVertex = encodeCoordinate(edgeVertices[1]);

      visited.add(checkVisitKey);
      // console.log('  Adding vertex', edgeVertices[1]);
      pathedVertices.push(encodedVertex);
    }
    if (i === shaper.edgeCount - 1) {
      // We are completely surrounded - just stop
      return;
    }
  }

  return followLeftHandSide(
    tiles,
    pathedVertices,
    shaper.getAdjacentTileCoordinates(current, facingDirection),
    facingDirection,
    shaper,
    visited
  );
}

export function generatePolygonVertices(
  gridCoordinates: GridPosition[],
  shaper: BaseTileShape
): PolygonVertex[] {
  if (gridCoordinates.length === 0) {
    return [];
  }

  const encodedTiles = new Map<string, GridPosition>();
  gridCoordinates.forEach((coord) => {
    encodedTiles.set(encodeCoordinate(coord), coord);
  });

  let currentEdgeIndex = 0;
  // Find any edge
  const polygonEdge = findOuterEdge(gridCoordinates);
  // Add that edge as first vertices
  const edgeCoords = shaper.getVertexCoordinatesForEdge(polygonEdge, currentEdgeIndex);

  const pathedVertices: string[] = [];
  pathedVertices.push(encodeCoordinate(edgeCoords[0]));

  currentEdgeIndex = shaper.turnRight(currentEdgeIndex);
  followLeftHandSide(encodedTiles, pathedVertices, polygonEdge, currentEdgeIndex, shaper);

  const vertices: PolygonVertex[] = [];
  pathedVertices.forEach((encoded) => {
    const vertex = decodeCoordinate(encoded);
    vertices.push(vertex);
  });

  return vertices;
}
