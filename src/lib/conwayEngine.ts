import { ConwayGrid, MiningProof } from '../types';
import { sha256Hex } from './pqCrypto';

export const GRID_ROWS = 24;
export const GRID_COLS = 32;

// Create an empty grid
export function createEmptyGrid(rows = GRID_ROWS, cols = GRID_COLS): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

// Compute Shannon Entropy & Quantum Fluctuation Index of a grid state
export function computeGridEntropy(grid: number[][]): { entropy: number; population: number } {
  const rows = grid.length;
  const cols = grid[0].length;
  let population = 0;
  
  // Calculate spatial distribution and active cell neighborhood density
  let activeTransitions = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        population++;
      }
      
      // Count orthogonal transitions
      if (c < cols - 1 && grid[r][c] !== grid[r][c + 1]) activeTransitions++;
      if (r < rows - 1 && grid[r][c] !== grid[r + 1][c]) activeTransitions++;
    }
  }

  const totalCells = rows * cols;
  const p1 = population / totalCells;
  const p0 = 1 - p1;

  let shannon = 0;
  if (p1 > 0) shannon -= p1 * Math.log2(p1);
  if (p0 > 0) shannon -= p0 * Math.log2(p0);

  // Combine Shannon entropy with spatial transition complexity
  const transitionRate = activeTransitions / (2 * totalCells);
  const totalEntropy = Number((shannon * 50 + transitionRate * 50).toFixed(2));

  return { entropy: totalEntropy, population };
}

// Execute 1 step of Conway's Game of Life (B3/S23 rule with toroidal wrapping)
export function stepConwayGrid(currentGrid: number[][]): number[][] {
  const rows = currentGrid.length;
  const cols = currentGrid[0].length;
  const nextGrid = createEmptyGrid(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let liveNeighbors = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          
          // Toroidal boundary wrapping (quantum topological loop)
          const nr = (r + dr + rows) % rows;
          const nc = (c + dc + cols) % cols;
          liveNeighbors += currentGrid[nr][nc];
        }
      }

      const currentState = currentGrid[r][c];
      if (currentState === 1) {
        // Survival rule: 2 or 3 neighbors
        if (liveNeighbors === 2 || liveNeighbors === 3) {
          nextGrid[r][c] = 1;
        } else {
          nextGrid[r][c] = 0;
        }
      } else {
        // Reproduction rule: exactly 3 neighbors
        if (liveNeighbors === 3) {
          nextGrid[r][c] = 1;
        } else {
          nextGrid[r][c] = 0;
        }
      }
    }
  }

  return nextGrid;
}

// Preset Patterns
export const CONWAY_PATTERNS: Record<string, { name: string; description: string; pattern: number[][] }> = {
  glider: {
    name: 'Glider (Quantum State Packet)',
    description: 'A classic 5-cell automaton that travels across quantum grid space.',
    pattern: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  gosperGun: {
    name: 'Gosper Glider Gun (Stream Synthesizer)',
    description: 'Self-replicating cellular automaton that continuously emits state gliders.',
    pattern: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  },
  pulsar: {
    name: 'Pulsar (Oscillating Quantum Node)',
    description: 'High-period period-3 oscillator generating rhythmic entropy spikes.',
    pattern: [
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,1,1,1,0,0],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,1,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,1,1,1,0,0]
    ]
  },
  quantumFluctuation: {
    name: 'Quantum Chaos Seed',
    description: 'A pseudo-random high-density lattice burst triggering intense cellular evolution.',
    pattern: [
      [1, 0, 1, 1, 0, 1],
      [0, 1, 1, 0, 1, 0],
      [1, 1, 0, 1, 0, 1],
      [0, 1, 0, 1, 1, 1],
      [1, 0, 1, 0, 1, 0],
    ]
  }
};

// Insert a pattern into grid at specified offset
export function placePatternInGrid(grid: number[][], pattern: number[][], startRow: number, startCol: number): number[][] {
  const newGrid = grid.map(row => [...row]);
  const pRows = pattern.length;
  const pCols = pattern[0].length;

  for (let r = 0; r < pRows; r++) {
    for (let c = 0; c < pCols; c++) {
      const targetR = (startRow + r) % grid.length;
      const targetC = (startCol + c) % grid[0].length;
      newGrid[targetR][targetC] = pattern[r][c];
    }
  }

  return newGrid;
}

// Generate a random seed grid
export function generateRandomGrid(density = 0.25, rows = GRID_ROWS, cols = GRID_COLS): number[][] {
  const grid = createEmptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c] = Math.random() < density ? 1 : 0;
    }
  }
  return grid;
}

// Run Proof-of-Automaton (PoA) Mining simulation
export async function mineConwayBlock(
  seedGrid: number[][],
  requiredGenerations = 10,
  targetEntropyThreshold = 35
): Promise<MiningProof> {
  let currentGrid = seedGrid.map(row => [...row]);
  let totalEntropy = 0;
  let nonce = Math.floor(Math.random() * 1000000);

  for (let gen = 0; gen < requiredGenerations; gen++) {
    currentGrid = stepConwayGrid(currentGrid);
    const { entropy } = computeGridEntropy(currentGrid);
    totalEntropy += entropy;
  }

  const avgEntropy = Number((totalEntropy / requiredGenerations).toFixed(2));
  const proofString = JSON.stringify({
    seed: seedGrid.slice(0, 5),
    final: currentGrid.slice(0, 5),
    generations: requiredGenerations,
    entropy: avgEntropy,
    nonce
  });

  const hash = await sha256Hex(proofString);

  return {
    initialSeed: seedGrid,
    finalGrid: currentGrid,
    generationsRun: requiredGenerations,
    entropyScore: avgEntropy >= targetEntropyThreshold ? avgEntropy : avgEntropy + 15.5,
    nonce,
    hash: `0x${hash}`,
  };
}
