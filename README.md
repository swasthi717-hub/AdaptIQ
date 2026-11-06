# AdaptIQ React + Flask project

## Folder map
- backend/app.py: Flask API, receives requests from React.
- backend/planner.py: Greedy Best-First Search and priority calculations.
- backend/requirements.txt: Python packages.
- frontend/src/App.jsx: Dashboard UI and interactions.
- frontend/src/styles.css: Visual design and responsive layout.
- frontend/src/main.jsx: Starts the React app.
- frontend/package.json: Frontend dependencies and commands.

## Run backend (VS Code terminal 1)
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
Backend runs at http://127.0.0.1:5000

## Run frontend (VS Code terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open the local URL Vite prints, usually http://localhost:5173

## How the connection works
React collects study inputs -> fetch() sends JSON to POST /api/plan -> Flask validates it -> planner.py runs GBFS -> Flask returns JSON -> React displays the plan.

## Important
The current version creates a single-session plan. It accepts at most 12 topics for demonstration. The heuristic and weights are design choices. GBFS does not guarantee a globally optimal schedule.
