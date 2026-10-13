# Smart Learner MVP

A simple web app where a student enters a topic and gets:
- a short explanation at their chosen level,
- ordered prerequisites,
- an ordered learning path,
- a mermaid flowchart to visualize the sequence/tree.

Files:
- server.js: Express server, handles /api/generate and calls OpenAI.
- public/index.html: Frontend UI.
- public/main.js: Frontend logic and mermaid rendering.
- package.json: project metadata.
- .gitignore, .env.example

Quick start (local):

1. Install Node.js (v16+).
2. Copy the files into a folder.
3. In the folder, run:
   npm install
4. Set environment variable OPENAI_API_KEY, or activate mock mode:

   - Mac/Linux:
     export OPENAI_API_KEY="sk-..."
     # or for mock:
     export USE_MOCK=true

   - Windows PowerShell:
     $env:OPENAI_API_KEY="sk-..."
     # or for mock:
     $env:USE_MOCK="true"

5. Start the server:
   npm start

6. Open http://localhost:3000 in your browser.

Quick start (Replit):
1. Create a new Replit -> Node.js.
2. Add these files (keep public/ folder).
3. In Replit Secrets, add OPENAI_API_KEY (or set USE_MOCK=true).
4. Click Run and open the web view.

Notes:
- Do NOT commit your OpenAI key to a public repo. Use environment variables or GitHub Secrets for deployments.
- If you get errors like "No JSON found", the model returned text that isn't strict JSON. Paste the raw output here and I will help fix the prompt.
- If you don't have access to the model named in server.js, replace `model: 'gpt-4o-mini'` with a model you have access to (for example `"gpt-3.5-turbo"`).

If you want, I can:
- Create the GitHub repository for you (I will need the repo name and whether it should be public or private), or
- Help you push these files step-by-step (I’ll give git commands and wait while you run them).