// Initialize mermaid but do not auto render; we'll render manually
if (window.mermaid) {
  mermaid.initialize({ startOnLoad: false });
}

const topicEl = document.getElementById('topic');
const levelEl = document.getElementById('level');
const generateBtn = document.getElementById('generate');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const explanationEl = document.getElementById('explanation');
const prereqEl = document.getElementById('prereq');
const stepsEl = document.getElementById('steps');
const graphEl = document.getElementById('graph');
const rawEl = document.getElementById('raw');

generateBtn.addEventListener('click', async () => {
  const topic = topicEl.value.trim();
  const level = levelEl.value;
  const formats = Array.from(document.querySelectorAll('input[name="format"]:checked')).map(i => i.value);
  if (!topic) return alert('Please enter a topic.');

  statusEl.textContent = 'Generating... (may take a few seconds)';
  generateBtn.disabled = true;

  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, level, formats })
    });
    const data = await resp.json();
    if (!data.ok) {
      alert('Error: ' + (data.error || JSON.stringify(data)));
      statusEl.textContent = '';
      generateBtn.disabled = false;
      return;
    }

    const r = data.result;
    resultEl.style.display = 'block';
    explanationEl.textContent = r.explanation || '';
    prereqEl.innerHTML = '';
    (r.prerequisites || r.prereq || []).forEach(p => {
      const li = document.createElement('li'); li.textContent = p; prereqEl.appendChild(li);
    });
    stepsEl.innerHTML = '';
    (r.steps || []).forEach(s => {
      const li = document.createElement('li'); li.textContent = s; stepsEl.appendChild(li);
    });

    rawEl.textContent = JSON.stringify(r, null, 2);

    // Render mermaid if present
    const mermaidText = r.mermaid || r.diagram || '';
    if (mermaidText && window.mermaid) {
      // Generate unique id for each render
      const id = 'mermaid-' + Date.now();
      mermaid.mermaidAPI.render(id, mermaidText, (svgCode) => {
        graphEl.innerHTML = svgCode;
      }, graphEl);
    } else {
      graphEl.innerHTML = '<i>No mermaid diagram returned.</i>';
    }

    statusEl.textContent = 'Done';
  } catch (e) {
    alert('Request failed: ' + e.message);
  } finally {
    generateBtn.disabled = false;
  }
});