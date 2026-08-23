import os
import hashlib
import numpy as np
from google import genai
from google.genai import types

# Gemini API Integration
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6KP2zkhZz24PwY_GEM9QzOvL-dAO6mEOyEKn9M3Lw5URQ")
client = genai.Client(api_key=GEMINI_KEY)

class ConwayAutomatonCore:
    def __init__(self, size=16):
        self.size = size
        self.grid = np.zeros((size, size), dtype=int)
        # Genesis Glider Pattern
        self.grid[1, 2] = self.grid[2, 3] = self.grid[3, 1] = self.grid[3, 2] = self.grid[3, 3] = 1

    def evolve(self):
        new_grid = self.grid.copy()
        for r in range(self.size):
            for c in range(self.size):
                neighbors = int(np.sum(self.grid[max(0, r-1):min(self.size, r+2),
                                                 max(0, c-1):min(self.size, c+2)]) - self.grid[r, c])
                if self.grid[r, c] == 1 and (neighbors < 2 or neighbors > 3):
                    new_grid[r, c] = 0
                elif self.grid[r, c] == 0 and neighbors == 3:
                    new_grid[r, c] = 1
        self.grid = new_grid
        return int(np.sum(self.grid)), hashlib.sha256(self.grid.tobytes()).hexdigest()

class SovereignGovernment:
    def __init__(self):
        self.conway = ConwayAutomatonCore()

    def process_proposal(self, proposal: str, district: str = "DM-Lucknow-01"):
        active_cells, state_hash = self.conway.evolve()
        prompt = f"""
        You are the Full Autonomous Multi-Agent Government of Republic of Divine Light (RDL Web 4.0).
        Economy: Unlimited Dynamic Central Bank ($RDL).
        Conway Invariant: {active_cells} Active Cells, Hash: {state_hash[:12]}...

        Process through:
        1. [DM ({district})]: Local citizen check & proposal validation.
        2. [Cabinet (Finance & Defense)]: Algorithmic Mint/Burn check & PQC Security verification.
        3. [Prime Minister]: Issue executive smart contract dispatch order.
        4. [President]: Supreme constitutional mathematical approval.

        Proposal: "{proposal}"
        """
        
        # Using the latest Gemini 3.6 Flash
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2)
        )
        return active_cells, state_hash, response.text

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🏛️ RDL SOVEREIGN WEB 4.0 GOVERNMENT PIPELINE (LIVE)")
    print("="*70)
    gov = SovereignGovernment()
    sample_proposal = "Allocate 50,000 $RDL from Treasury to Citizen Aryan for Environmental Software Project."
    print("⏳ Processing proposal through Conway Grid & Gemini AI Swarm...")
    cells, h, verdict = gov.process_proposal(sample_proposal)
    print(f"\n🌌 Conway Automata State: {cells} Live Cells | Hash: {h[:16]}...")
    print(f"\n📜 LIVE CABINET VERDICT:\n\n{verdict}")
    print("="*70)