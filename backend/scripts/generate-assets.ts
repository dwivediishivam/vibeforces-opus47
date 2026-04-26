import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { challengeLibrary } from "../../shared/challenge-library";
import { htmlToScreenshot } from "../src/services/screenshot";

const rootDir = process.cwd();
const screenshotsDir = path.join(rootDir, "frontend/public/screenshots");
const voiceNotesDir = path.join(rootDir, "frontend/public/voice-notes");
const brandDir = path.join(rootDir, "frontend/public/brand");

const supplementarySvgs: Record<string, string> = {
  "spec-rest-api-table.svg": String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" fill="none">
  <rect width="1200" height="720" fill="#030712"/>
  <rect x="72" y="92" width="1056" height="536" rx="28" fill="#0A0F1E" stroke="#1E293B"/>
  <text x="108" y="156" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="34" font-weight="700">Todo API Endpoints</text>
  <rect x="108" y="196" width="984" height="72" rx="18" fill="#111827"/>
  <rect x="108" y="286" width="984" height="72" rx="18" fill="#111827"/>
  <rect x="108" y="376" width="984" height="72" rx="18" fill="#111827"/>
  <rect x="108" y="466" width="984" height="72" rx="18" fill="#111827"/>
  <text x="140" y="242" fill="#A78BFA" font-family="JetBrains Mono, monospace" font-size="26">GET</text>
  <text x="300" y="242" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="24">/todos</text>
  <text x="580" y="242" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">List all, optionally filter with ?status=</text>
  <text x="140" y="332" fill="#A78BFA" font-family="JetBrains Mono, monospace" font-size="26">GET</text>
  <text x="300" y="332" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="24">/todos/:id</text>
  <text x="580" y="332" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">Fetch one todo item</text>
  <text x="140" y="422" fill="#A78BFA" font-family="JetBrains Mono, monospace" font-size="26">POST</text>
  <text x="300" y="422" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="24">/todos</text>
  <text x="580" y="422" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">Create with title, description, status</text>
  <text x="140" y="512" fill="#A78BFA" font-family="JetBrains Mono, monospace" font-size="26">PUT</text>
  <text x="300" y="512" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="24">/todos/:id</text>
  <text x="580" y="512" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">Update fields with validation</text>
  <text x="140" y="602" fill="#A78BFA" font-family="JetBrains Mono, monospace" font-size="26">DELETE</text>
  <text x="300" y="602" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="24">/todos/:id</text>
  <text x="580" y="602" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">Remove the todo and return 204</text>
</svg>`,
  "spec-markdown-example.svg": String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" fill="none">
  <rect width="1200" height="720" fill="#030712"/>
  <rect x="68" y="84" width="496" height="552" rx="28" fill="#0A0F1E" stroke="#1E293B"/>
  <rect x="636" y="84" width="496" height="552" rx="28" fill="#111827" stroke="#1E293B"/>
  <text x="108" y="144" fill="#A78BFA" font-family="JetBrains Mono, monospace" font-size="30" font-weight="700">Markdown Input</text>
  <text x="676" y="144" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="30" font-weight="700">Expected HTML</text>
  <text x="108" y="214" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24"># Heading One</text>
  <text x="108" y="254" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">## Heading Two</text>
  <text x="108" y="294" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">- Item One</text>
  <text x="108" y="334" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">- Item Two</text>
  <text x="108" y="374" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">**bold** and *italic*</text>
  <text x="108" y="434" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="22">&#96;&#96;&#96;</text>
  <text x="108" y="470" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="22">const x = 1;</text>
  <text x="108" y="506" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="22">&#96;&#96;&#96;</text>
  <text x="676" y="214" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="30" font-weight="700">&lt;h1&gt;Heading One&lt;/h1&gt;</text>
  <text x="676" y="262" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="26" font-weight="700">&lt;h2&gt;Heading Two&lt;/h2&gt;</text>
  <text x="676" y="322" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="24">&lt;ul&gt;</text>
  <text x="708" y="360" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">&lt;li&gt;Item One&lt;/li&gt;</text>
  <text x="708" y="396" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">&lt;li&gt;Item Two&lt;/li&gt;</text>
  <text x="676" y="434" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="24">&lt;/ul&gt;</text>
  <text x="676" y="486" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">&lt;strong&gt;bold&lt;/strong&gt;</text>
  <text x="676" y="522" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">&lt;em&gt;italic&lt;/em&gt;</text>
  <rect x="676" y="552" width="360" height="54" rx="18" fill="#0A0F1E" stroke="#334155"/>
  <text x="706" y="586" fill="#A78BFA" font-family="JetBrains Mono, monospace" font-size="22">&lt;pre&gt;&lt;code&gt;const x = 1;&lt;/code&gt;&lt;/pre&gt;</text>
</svg>`,
  "spec-chat-architecture.svg": String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" fill="none">
  <rect width="1200" height="720" fill="#030712"/>
  <text x="92" y="120" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="34" font-weight="700">Socket Rooms + Broadcast Flow</text>
  <rect x="94" y="188" width="210" height="120" rx="24" fill="#0A0F1E" stroke="#1E293B"/>
  <rect x="494" y="156" width="212" height="188" rx="24" fill="#111827" stroke="#7C3AED"/>
  <rect x="896" y="188" width="210" height="120" rx="24" fill="#0A0F1E" stroke="#1E293B"/>
  <text x="144" y="248" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="28">Client A</text>
  <text x="546" y="222" fill="#A78BFA" font-family="JetBrains Mono, monospace" font-size="30" font-weight="700">Socket.io</text>
  <text x="546" y="262" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">Room join / leave</text>
  <text x="546" y="296" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">/users command</text>
  <text x="946" y="248" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="28">Client B</text>
  <path d="M304 248H494" stroke="#7C3AED" stroke-width="6" stroke-linecap="round"/>
  <path d="M706 248H896" stroke="#7C3AED" stroke-width="6" stroke-linecap="round"/>
  <rect x="230" y="460" width="740" height="158" rx="26" fill="#0A0F1E" stroke="#1E293B"/>
  <text x="274" y="520" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="28">Room State</text>
  <text x="274" y="562" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">• unique usernames across the server</text>
  <text x="274" y="598" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">• last 50 messages retained per room</text>
  <text x="670" y="562" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">• join event notifies everyone else</text>
  <text x="670" y="598" fill="#94A3B8" font-family="Inter, sans-serif" font-size="22">• messages broadcast to room peers only</text>
</svg>`,
  "spec-task-graph.svg": String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" fill="none">
  <rect width="1200" height="720" fill="#030712"/>
  <text x="86" y="112" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="34" font-weight="700">Dependency Graph + Critical Path</text>
  <circle cx="196" cy="260" r="54" fill="#111827" stroke="#A78BFA" stroke-width="4"/>
  <circle cx="196" cy="470" r="54" fill="#111827" stroke="#1E293B" stroke-width="4"/>
  <circle cx="460" cy="260" r="54" fill="#111827" stroke="#A78BFA" stroke-width="4"/>
  <circle cx="460" cy="470" r="54" fill="#111827" stroke="#1E293B" stroke-width="4"/>
  <circle cx="736" cy="364" r="54" fill="#111827" stroke="#A78BFA" stroke-width="4"/>
  <circle cx="1008" cy="364" r="54" fill="#111827" stroke="#A78BFA" stroke-width="4"/>
  <path d="M250 260H406" stroke="#A78BFA" stroke-width="6" stroke-linecap="round"/>
  <path d="M250 470H406" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <path d="M514 260L682 342" stroke="#A78BFA" stroke-width="6" stroke-linecap="round"/>
  <path d="M514 470L682 386" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <path d="M790 364H954" stroke="#A78BFA" stroke-width="6" stroke-linecap="round"/>
  <text x="172" y="268" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">T1</text>
  <text x="172" y="478" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">T2</text>
  <text x="436" y="268" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">T3</text>
  <text x="436" y="478" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">T4</text>
  <text x="712" y="372" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">T5</text>
  <text x="980" y="372" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="24">T6</text>
  <text x="90" y="632" fill="#A78BFA" font-family="Inter, sans-serif" font-size="24">Highlighted path = longest dependent chain</text>
</svg>`,
};

async function ensureDirectories() {
  for (const dir of [screenshotsDir, voiceNotesDir, brandDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeSupplementarySvgs() {
  for (const [filename, content] of Object.entries(supplementarySvgs)) {
    fs.writeFileSync(path.join(screenshotsDir, filename), content, "utf8");
  }
}

async function renderUiScreenshots() {
  const uiChallenges = challengeLibrary.filter(
    (challenge) => challenge.category === "ui_reproduction",
  );

  for (const challenge of uiChallenges) {
    const buffer = await htmlToScreenshot(
      challenge.challenge_data.target_html_css as string,
    );
    const filename = path.basename(
      challenge.challenge_data.target_screenshot_url as string,
    );
    fs.writeFileSync(path.join(screenshotsDir, filename), buffer);
  }
}

function generateVoiceNotes() {
  const voiceChallenges = challengeLibrary.filter(
    (challenge) => challenge.category === "spec_to_prompt",
  );

  for (const challenge of voiceChallenges) {
    const target = path.join(
      voiceNotesDir,
      path.basename(challenge.challenge_data.voice_note_url as string),
    );
    const temp = path.join(os.tmpdir(), `${challenge.code}.aiff`);

    execFileSync("say", ["-v", "Samantha", "-r", "185", "-o", temp, challenge.challenge_data.voice_note_script as string]);
    execFileSync("ffmpeg", ["-y", "-i", temp, target], { stdio: "ignore" });
    fs.rmSync(temp, { force: true });
  }
}

function writeBrandSvg() {
  const brand = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="120" fill="#030712"/>
  <rect x="32" y="32" width="448" height="448" rx="104" fill="#0A0F1E" stroke="#1E293B" stroke-width="10"/>
  <text x="94" y="288" fill="#F1F5F9" font-family="JetBrains Mono, monospace" font-size="136" font-weight="800">VF</text>
  <circle cx="390" cy="142" r="36" fill="#7C3AED"/>
  <circle cx="390" cy="142" r="70" fill="#7C3AED" opacity="0.22"/>
</svg>`;
  fs.writeFileSync(path.join(brandDir, "vf-monogram.svg"), brand, "utf8");
}

async function main() {
  await ensureDirectories();
  writeSupplementarySvgs();
  await renderUiScreenshots();
  generateVoiceNotes();
  writeBrandSvg();
  process.stdout.write("Generated screenshots, voice notes, and brand assets.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
