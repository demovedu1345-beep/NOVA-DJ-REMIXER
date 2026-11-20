import fs from 'fs';

const agents = [
  { name: 'Agent 1', id: '3e39363a-3038-426f-b958-8cebb7df9117' },
  { name: 'Agent 2', id: '2f0761bf-070d-422f-89bf-8ecb5670a2e0' },
  { name: 'Agent 3', id: '2bf3962e-3eaf-462e-9756-ee5fe10d1377' },
  { name: 'Agent 4', id: '397b51b1-ab4c-4fb4-9d26-97ac608c344d' },
  { name: 'Agent 5', id: 'e645656f-4b32-4e92-8ea7-e816783514f8' },
  { name: 'Agent 6', id: 'd57cf716-3d74-4b20-baac-e67b1148661f' },
  { name: 'Agent 7', id: '030f3537-de34-49a1-b35e-e45d8ae393e0' },
  { name: 'Agent 8', id: '8593fa57-b550-4a21-944a-42b14be5f8d5' },
];

for (const a of agents) {
  const logFile = `C:/Users/itzra/.gemini/antigravity/brain/${a.id}/.system_generated/logs/transcript.jsonl`;
  if (fs.existsSync(logFile)) {
    const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
    const last = JSON.parse(lines[lines.length - 1]);
    const summary = last.tool_calls ? `Tool: ${last.tool_calls[0].name} (${last.tool_calls[0].args?.toolSummary || 'no summary'})` : (last.content ? last.content.slice(0, 80) : 'thinking/response');
    console.log(`${a.name.padEnd(10)} [Step ${last.step_index}]: ${summary}`);
  } else {
    console.log(`${a.name.padEnd(10)}: No transcript yet`);
  }
}
