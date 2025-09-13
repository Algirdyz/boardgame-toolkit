import { GridPosition } from '@shared/templates';

type PolygonVertex = { x: number; y: number };

export function getTileShape(edgeCount: number, tileSize: number): BaseTileShape {
  switch (edgeCount) {
    case 4:
      return new SquareTileShape(tileSize);
    case 6:
      return new HexagonTileShape(tileSize);
    default:
      throw new Error('Unsupported tile shape');
  }
}

export abstract class BaseTileShape {
  tileSize: number;
  constructor(tileSize: number) {
    this.tileSize = tileSize;
  }
  abstract edgeCount: number;
  abstract getVertexCoordinates(pos: GridPosition, vertexIndex: number): PolygonVertex;
  getVertexCoordinatesForEdge(
    pos: GridPosition,
    edgeindex: number
  ): [PolygonVertex, PolygonVertex] {
    const vertex1 = this.getVertexCoordinates(pos, edgeindex);
    const vertex2 = this.getVertexCoordinates(pos, (edgeindex + 1) % this.edgeCount);
    return [vertex1, vertex2];
  }

  abstract getAdjacentTileCoordinates(target: GridPosition, edgeIndex: number): GridPosition;
  getWorldPosition(pos: GridPosition): { x: number; y: number } {
    return this.getVertexCoordinates(pos, 0);
  }

  getBaseVertices(): PolygonVertex[] {
    return this.getAllVertices({ x: 0, y: 0 });
  }

  getAdjacentTileCoordinatesEncoded(target: GridPosition, edgeIndex: number): string {
    const pos = this.getAdjacentTileCoordinates(target, edgeIndex);
    return `${pos.x},${pos.y}`;
  }

  // Get all adjacent positions for a tile (used by shape generator)
  getAllAdjacentPositions(target: GridPosition): GridPosition[] {
    const adjacentPositions: GridPosition[] = [];
    for (let i = 0; i < this.edgeCount; i++) {
      adjacentPositions.push(this.getAdjacentTileCoordinates(target, i));
    }
    return adjacentPositions;
  }

  // Get all vertices of a tile shape (used for drawing outlines)
  getAllVertices(pos: GridPosition): PolygonVertex[] {
    const vertices: PolygonVertex[] = [];
    for (let i = 0; i < this.edgeCount; i++) {
      const vertex1 = this.getVertexCoordinates(pos, i);
      vertices.push(vertex1);
    }
    return vertices;
  }

  turnRight(currentDirection: number): number {
    return (currentDirection + 1) % this.edgeCount;
  }
  turnLeft(currentDirection: number): number {
    return (currentDirection - 1 + this.edgeCount) % this.edgeCount;
  }
  turnAround(currentDirection: number): number {
    return (currentDirection + this.edgeCount / 2) % this.edgeCount;
  }
}

class SquareTileShape extends BaseTileShape {
  edgeCount = 4;

  getVertexCoordinates(pos: GridPosition, vertexIndex: number): PolygonVertex {
    const x = pos.x * this.tileSize;
    const y = pos.y * this.tileSize;
    switch (vertexIndex) {
      case 0:
        return { x, y };
      case 1:
        return { x, y: y - this.tileSize };
      case 2:
        return { x: x + this.tileSize, y: y - this.tileSize };
      case 3:
        return { x: x + this.tileSize, y };
      default:
        throw new Error('Invalid vertex index for square');
    }
  }

  getAdjacentTileCoordinates(target: GridPosition, edgeIndex: number): GridPosition {
    switch (edgeIndex) {
      case 0: // Left
        return { x: target.x - 1, y: target.y };
      case 1: // Top
        return { x: target.x, y: target.y - 1 };
      case 2: // Right
        return { x: target.x + 1, y: target.y };
      case 3: // Bottom
        return { x: target.x, y: target.y + 1 };
      default:
        throw new Error('Invalid edge index for square');
    }
  }
}

class HexagonTileShape extends BaseTileShape {
  edgeCount = 6;

  getVertexCoordinates(pos: GridPosition, vertexIndex: number): PolygonVertex {
    if (vertexIndex < 0 || vertexIndex >= 6) {
      throw new Error('Invalid vertex index for hexagon');
    }

    const sqrt3 = Math.sqrt(3);

    // Flat top and bottom
    const H = sqrt3 * (this.tileSize / 2); // flat-to-flat width
    const W = this.tileSize; // corner-to-corner height

    const x = pos.x * ((3 / 4) * this.tileSize);
    const y = (pos.y * H) / 2;

    switch (vertexIndex) {
      case 0:
        return { x: x + W / 4, y };
      case 1:
        return { x: x + (3 * W) / 4, y };
      case 2:
        return { x: x + W, y: y + H / 2 };
      case 3:
        return { x: x + (3 * W) / 4, y: y + H };
      case 4:
        return { x: x + W / 4, y: y + H };
      case 5:
        return { x, y: y + H / 2 };
      default:
        throw new Error('Invalid vertex index for hexagon');
    }
  }

  getAdjacentTileCoordinates(target: GridPosition, edgeIndex: number): GridPosition {
    // Using doubled coordinate system
    switch (edgeIndex) {
      case 0: // Top Left
        return { x: target.x - 1, y: target.y - 1 };
      case 1: // Top
        return { x: target.x, y: target.y - 2 };
      case 2: // Top Right
        return { x: target.x + 1, y: target.y - 1 };
      case 3: // Bottom Right
        return { x: target.x + 1, y: target.y + 1 };
      case 4: // Bottom
        return { x: target.x, y: target.y + 2 };
      case 5: // Bottom Left
        return { x: target.x - 1, y: target.y + 1 };
      default:
        throw new Error('Invalid edge index for hexagon');
    }
  }
}
