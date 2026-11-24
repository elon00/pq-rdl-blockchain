import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Cpu,
  Dices,
  Layers,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  GRID_ROWS,
  GRID_COLS,
  createEmptyGrid,
  generateRandomGrid,
  stepConwayGrid,
  computeGridEntropy,
  CONWAY_PATTERNS,
  placePatternInGrid
} from '../lib/conwayEngine';
import { Block, PQKeypair } from '../types';

interface ConwayMinerViewProps {
  onBlockMined: (block: Block) => void;
  activeWallet: PQKeypair | null;
}

export const ConwayMinerView: React.FC<ConwayMinerViewProps> = ({
  onBlockMined,
  activeWallet,
}) => {
  const [grid, setGrid] = useState<number[][]>(() => generateRandomGrid(0.28));
  const [generation, setGeneration] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMining, setIsMining] = useState<boolean>(false);
  const [miningStatus, setMiningStatus] = useState<string>('');

  const { entropy, population } = computeGridEntropy(grid);

  // Auto-play interval ref
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setGrid((prevGrid) => {
          const next = stepConwayGrid(prevGrid);
          return next;
        });
        setGeneration((gen) => gen + 1);
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Handle cell click toggle
  const handleCellClick = (r: number, c: number) => {
    setGrid((prevGrid) => {
      const next = prevGrid.map((row) => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
  };

  // Step 1 generation
  const handleStepOnce = () => {
    setGrid((prev) => stepConwayGrid(prev));
    setGeneration((g) => g + 1);
  };

  // Load preset pattern
  const handleLoadPattern = (key: string) => {
    const patternObj = CONWAY_PATTERNS[key];
    if (!patternObj) return;
    setIsRunning(false);
    const empty = createEmptyGrid();
    const loaded = placePatternInGrid(empty, patternObj.pattern, 4, 6);
    setGrid(loaded);
    setGeneration(0);
  };

  // Randomize grid
  const handleRandomize = () => {
    setIsRunning(false);
    setGrid(generateRandomGrid(0.25));
    setGeneration(0);
  };

  // Clear grid
  const handleClear = () => {
    setIsRunning(false);
    setGrid(createEmptyGrid());
    setGeneration(0);
  };

  // Mine Block Action
  const handleMineBlock = async () => {
    setIsMining(true);
    setMiningStatus('Evolving Conway Automaton Matrix Generations...');

    try {
      const minerAddr = activeWallet ? activeWallet.address : 'pq1q_conway_miner_node_99';
      const algo = activeWallet ? activeWallet.algorithm : 'Dilithium2';

      const res = await fetch('/api/blockchain/mine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minerAddress: minerAddr,
          seedGrid: grid,
          algorithm: algo,
        }),
      });

      const data = await res.json();

      if (data.success && data.block) {
        setMiningStatus(`Block #${data.block.height} Mined Successfully!`);

        // Trigger celebration confetti
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f3ff', '#a855f7', '#10b981', '#f59e0b'],
        });

        onBlockMined(data.block);
      } else {
        setMiningStatus('Block mining failed.');
      }
    } catch (err: any) {
      setMiningStatus(`Mining Error: ${err.message}`);
    } finally {
      setIsMining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Proof-of-Automaton (PoA) Mining Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
            Conway Automaton Block Consensus
          </h2>
          <p className="text-slate-400 text-xs">
            Draw cell patterns or select quantum seeds. Evolve generations to generate block entropy proof.
          </p>
        </div>

        {/* Mine Action Button */}
        <button
          onClick={handleMineBlock}
          disabled={isMining}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold font-mono px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer transition-all"
        >
          {isMining ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Mining Quantum Block...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Mine Block with Current Pattern</span>
            </>
          )}
        </button>
      </div>

      {miningStatus && (
        <div className="bg-cyan-950/80 border border-cyan-500/40 p-3 rounded-xl flex items-center gap-2 text-xs font-mono text-cyan-300">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{miningStatus}</span>
        </div>
      )}

      {/* Main Grid & Controls Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Conway Grid Interactive Canvas */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          {/* Top Grid Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4">
              <span>
                Gen: <strong className="text-cyan-400">{generation}</strong>
              </span>
              <span>
                Cells Alive: <strong className="text-emerald-400">{population}</strong>
              </span>
              <span>
                Entropy H(x): <strong className="text-amber-300">{entropy}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">
                {isRunning ? 'Evolving Matrix...' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Conway Cellular Grid Matrix */}
          <div className="overflow-x-auto bg-slate-950 p-3 rounded-xl border border-cyan-500/20 flex justify-center">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                width: '100%',
                maxWidth: '680px',
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`aspect-square rounded-xs transition-all duration-150 cursor-pointer ${
                      cell === 1
                        ? 'bg-gradient-to-br from-cyan-400 to-teal-400 shadow-sm shadow-cyan-400/80 scale-100'
                        : 'bg-slate-900 hover:bg-slate-800/80 border border-slate-800/60'
                    }`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Interactive Simulation Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  isRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Evolution
                  </>
                )}
              </button>

              <button
                onClick={handleStepOnce}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Step 1 Gen
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRandomize}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <Dices className="w-3.5 h-3.5 text-purple-400" />
                Randomize
              </button>

              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Preset Quantum Patterns & Entropy Mechanics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Conway Preset Quantum Seeds</span>
            </h3>

            <div className="space-y-2">
              {Object.entries(CONWAY_PATTERNS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleLoadPattern(key)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all group cursor-pointer"
                >
                  <div className="font-bold text-xs text-cyan-300 group-hover:text-cyan-200 font-mono">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Proof-of-Automaton Explanation */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold">
              <Info className="w-4 h-4" />
              <span>Proof-of-Automaton Math</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
              The block hash is generated by hashing the initial cellular grid seed, running 15 steps of Conway's
              B3/S23 rules, calculating Shannon entropy H(x) across topological wraparound space, and signing the
              result with a Post-Quantum signature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
