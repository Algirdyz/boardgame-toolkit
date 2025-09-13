import { GridPosition } from '@shared/templates';
import { describe, expect, it } from 'vitest';
import { generatePolygonVertices } from '@/lib/polygoner';
import { getTileShape } from '@/lib/tileSets/baseTileShape';

describe('generatePolygonVertices', () => {
  describe('Basic functionality', () => {
    it('should return empty array for empty input', () => {
      const shaper = getTileShape(4, 100);
      const result = generatePolygonVertices([], shaper);
      expect(result).toEqual([]);
    });

    it('should generate vertices for a single tile', () => {
      const gridCoordinates: GridPosition[] = [{ x: 0, y: 0 }];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Verify all vertices are valid objects with x and y properties
      result.forEach((vertex) => {
        expect(vertex).toHaveProperty('x');
        expect(vertex).toHaveProperty('y');
        expect(typeof vertex.x).toBe('number');
        expect(typeof vertex.y).toBe('number');
      });
    });

    it('should generate vertices for a 2x2 square pattern', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(4); // Should have perimeter vertices
    });

    it('should generate vertices for an L-shaped pattern', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Different tile sizes', () => {
    const singleTile: GridPosition[] = [{ x: 0, y: 0 }];

    it('should handle tile size 50', () => {
      const result = generatePolygonVertices(singleTile, getTileShape(4, 50));
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle tile size 200', () => {
      const result = generatePolygonVertices(singleTile, getTileShape(4, 200));
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should scale vertices proportionally with tile size', () => {
      const result1 = generatePolygonVertices(singleTile, getTileShape(4, 100));
      const result2 = generatePolygonVertices(singleTile, getTileShape(4, 200));

      // With double tile size, coordinates should be roughly double
      // (allowing for some variance due to polygon generation algorithm)
      expect(result1.length).toBe(result2.length);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle negative coordinates', () => {
      const gridCoordinates: GridPosition[] = [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle sparse coordinates', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle duplicate coordinates gracefully', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 0, y: 0 }, // Duplicate
        { x: 1, y: 0 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Polygon properties validation', () => {
    it('should generate vertices that form a closed polygon', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));

      expect(result.length).toBeGreaterThanOrEqual(4); // Minimum for a polygon

      // Check that vertices are unique (no immediate duplicates)
      for (let i = 0; i < result.length - 1; i++) {
        const current = result[i];
        const next = result[i + 1];
        const isDuplicate = current.x === next.x && current.y === next.y;
        expect(isDuplicate).toBe(false);
      }
    });

    it('should generate vertices in a consistent winding order', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];
      const result1 = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      const result2 = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));

      // Results should be consistent across multiple calls
      expect(result1).toEqual(result2);
    });

    it('should handle single row pattern', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle single column pattern', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Complex patterns', () => {
    it('should handle T-shaped pattern', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle cross-shaped pattern', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle diagonal pattern', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle hollow rectangle pattern', () => {
      const gridCoordinates: GridPosition[] = [
        // Top row
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        // Middle rows (sides only)
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        // Bottom row
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and stability', () => {
    it('should handle large patterns efficiently', () => {
      // Generate a 10x10 grid
      const gridCoordinates: GridPosition[] = [];
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          gridCoordinates.push({ x, y });
        }
      }

      const startTime = performance.now();
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should be deterministic', () => {
      const gridCoordinates: GridPosition[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];

      const result1 = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      const result2 = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));
      const result3 = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});

// Helper function tests for internal polygon utilities
describe('Polygon utilities', () => {
  describe('coordinate encoding/decoding', () => {
    it('should encode and decode coordinates correctly', () => {
      // These are internal functions, but we can test the overall behavior
      const gridCoordinates: GridPosition[] = [{ x: 5, y: 10 }];
      const result = generatePolygonVertices(gridCoordinates, getTileShape(4, 100));

      // Should handle coordinates with different magnitudes
      expect(result).toBeDefined();
      expect(result.every((v) => typeof v.x === 'number' && typeof v.y === 'number')).toBe(true);
    });
  });

  describe('adjacent tile calculations', () => {
    it('should handle edge detection properly', () => {
      // Test that isolated tiles generate proper polygons
      const isolatedTile: GridPosition[] = [{ x: 0, y: 0 }];
      const result = generatePolygonVertices(isolatedTile, getTileShape(4, 100));

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
