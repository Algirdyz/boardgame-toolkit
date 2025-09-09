import { GridPosition } from "@shared/templates";


type PolygonVertex = { x: number; y: number };

type AdjacencyList = Map<string, PolygonVertex[]>;

type GraphEdge = {
  p1: PolygonVertex;
  p2: PolygonVertex;
  // A unique string identifier for the edge (normalized)
  id: string;
};

export function generateTiledPolygonVertices(
  gridCoordinates: GridPosition[],
  tileSize: number
): PolygonVertex[] {
  if (gridCoordinates.length === 0) {
    return [];
  }

  const activeTiles = new Set<string>();
  gridCoordinates.forEach(coord => activeTiles.add(`${coord.x},${coord.y}`));

  const edges: { [key: string]: number } = {}; // Store edge counts

  gridCoordinates.forEach(coord => {
    const minX = coord.x * tileSize;
    const minY = coord.y * tileSize;
    const maxX = (coord.x + 1) * tileSize;
    const maxY = (coord.y + 1) * tileSize;

    const tileEdges: { p1: PolygonVertex; p2: PolygonVertex }[] = [
      { p1: { x: minX, y: minY }, p2: { x: maxX, y: minY } }, // Top edge
      { p1: { x: maxX, y: minY }, p2: { x: maxX, y: maxY } }, // Right edge
      { p1: { x: maxX, y: maxY }, p2: { x: minX, y: maxY } }, // Bottom edge
      { p1: { x: minX, y: maxY }, p2: { x: minX, y: minY } }  // Left edge
    ];

    if (!activeTiles.has(`${coord.x},${coord.y - 1}`)) {
      incrementEdge(edges, tileEdges[0]);
    }
    if (!activeTiles.has(`${coord.x + 1},${coord.y}`)) {
      incrementEdge(edges, tileEdges[1]);
    }
    if (!activeTiles.has(`${coord.x},${coord.y + 1}`)) {
      incrementEdge(edges, tileEdges[2]);
    }
    if (!activeTiles.has(`${coord.x - 1},${coord.y}`)) {
      incrementEdge(edges, tileEdges[3]);
    }
  });

  const perimeterEdges: GraphEdge[] = [];
  for (const key in edges) {
    if (edges[key] === 1) {
      const [p1Str, p2Str] = key.split(':');
      const p1Coords = p1Str.split(',').map(Number);
      const p2Coords = p2Str.split(',').map(Number);
      perimeterEdges.push({
        p1: { x: p1Coords[0], y: p1Coords[1] },
        p2: { x: p2Coords[0], y: p2Coords[1] },
        id: key // Store the normalized key for tracking
      });
    }
  }

  if (perimeterEdges.length === 0) {
    return [];
  }

  // Build an adjacency list for the perimeter vertices
  const adjList: AdjacencyList = new Map();

  perimeterEdges.forEach(edge => {
    const p1Key = `${edge.p1.x},${edge.p1.y}`;
    const p2Key = `${edge.p2.x},${edge.p2.y}`;

    if (!adjList.has(p1Key)) adjList.set(p1Key, []);
    adjList.get(p1Key)!.push(edge.p2);

    if (!adjList.has(p2Key)) adjList.set(p2Key, []);
    adjList.get(p2Key)!.push(edge.p1); // Also add reverse for bidirectional traversal
  });

  // Track visited edges to avoid infinite loops and ensure each edge is used once
  const visitedEdgeIds = new Set<string>();
  const polygon: PolygonVertex[] = [];

  // Start at an arbitrary point that has an unvisited edge
  let startVertexKey: string | undefined;
  for (const edge of perimeterEdges) {
    if (!visitedEdgeIds.has(edge.id)) {
      startVertexKey = `${edge.p1.x},${edge.p1.y}`;
      break;
    }
  }

  if (!startVertexKey) {
    return []; // No unvisited edges found, should not happen if perimeterEdges is not empty
  }

  // Use a stack/array for DFS-like traversal
  let currentVertexKey = startVertexKey;
  let currentVertex: PolygonVertex = {
    x: parseInt(currentVertexKey.split(',')[0], 10),
    y: parseInt(currentVertexKey.split(',')[1], 10)
  };
  polygon.push(currentVertex);

  // Keep traversing until we return to the start or run out of unvisited edges
  while (true) {
    let foundNext = false;
    const neighbors = adjList.get(currentVertexKey) || [];

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      const edgeId = getNormalizedEdgeId(currentVertex, neighbor);

      if (!visitedEdgeIds.has(edgeId)) {
        visitedEdgeIds.add(edgeId);
        polygon.push(neighbor);
        currentVertex = neighbor;
        currentVertexKey = neighborKey;
        foundNext = true;
        break; // Move to the next point
      }
    }

    if (!foundNext) {
      // If we couldn't find a next unvisited edge, we've either closed a loop
      // or reached a dead end (which shouldn't happen in a simple polygon).
      // Check if we're back at the start.
      if (polygon.length > 1 &&
        polygon[0].x === polygon[polygon.length - 1].x &&
        polygon[0].y === polygon[polygon.length - 1].y) {
        polygon.pop(); // Remove duplicate closing point
      }
      break; // Exit the loop as the current path is complete
    }

    // If we've visited all perimeter edges, we're done
    if (visitedEdgeIds.size === perimeterEdges.length) {
      break;
    }

    // Important for complex cases: If we finished a loop but there are still unvisited edges,
    // it implies multiple disconnected polygons or holes. For this problem, we assume
    // a single contiguous outer boundary. If you need to handle holes, this part
    // would need to be enhanced to find new starting points for inner loops.
    // For now, if we cannot find a next step, we break.
  }

  return polygon;
}

// Helper to safely add/increment edge counts
function incrementEdge(
  edges: { [key: string]: number },
  edge: { p1: PolygonVertex; p2: PolygonVertex }
) {
  const normalizedKey = getNormalizedEdgeId(edge.p1, edge.p2);
  edges[normalizedKey] = (edges[normalizedKey] || 0) + 1;
}

// Helper to get a consistent string ID for an edge regardless of point order
function getNormalizedEdgeId(p1: PolygonVertex, p2: PolygonVertex): string {
  // To ensure consistent ordering, we'll compare the points.
  // We can compare by X first, then by Y.
  let firstPoint: PolygonVertex;
  let secondPoint: PolygonVertex;

  if (p1.x < p2.x || (p1.x === p2.x && p1.y < p2.y)) {
    firstPoint = p1;
    secondPoint = p2;
  } else {
    firstPoint = p2;
    secondPoint = p1;
  }
  return `${firstPoint.x},${firstPoint.y}:${secondPoint.x},${secondPoint.y}`;
}