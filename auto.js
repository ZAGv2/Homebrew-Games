const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const fetch = require('node-fetch');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = 'ZAGv2';
const repo = 'Homebrew-Games';

const templatePath = path.join(__dirname,'template.html');
const indexPath = path.join(__dirname,'index.html');
const outputFolder = path.join(__dirname,'games-pages');
const tempFolder = path.join(__dirname,'temp');

fs.mkdirSync(outputFolder, { recursive: true });
fs.mkdirSync(tempFolder, { recursive: true });

// Validation function
function validateMetadata(metadataPath) {
    const content = fs.readFileSync(metadataPath, 'utf8');
    const lines = content.split(/\r?\n/);
    const fields = {};
    lines.forEach(line => {
        const [key, ...rest] = line.split(':');
        if(key && rest.length) fields[key.trim()] = rest.join(':').trim();
    });
    const required = ['Title','Console','Creator','Year','Description'];
    required.forEach(f => {
        if(!fields[f]) throw new Error(`Metadata missing field: ${f}`);
    });
    return fields;
}

async function run() {
    const releases = await octokit.repos.listReleases({ owner, repo });
    const games = [];

    for(const release of releases.data){
        const gameAsset = release.assets.find(a => !a.name.endsWith('.details.zip'));
        const detailsAsset = release.assets.find(a => a.name.endsWith('.details.zip'));
        if(!gameAsset || !detailsAsset) continue;

        // Download details zip
        const tempZip = path.join(tempFolder, detailsAsset.name);
        const res = await fetch(detailsAsset.browser_download_url);
        const buffer = await res.buffer();
        fs.writeFileSync(tempZip, buffer);

        const zip = new AdmZip(tempZip);
        const extractPath = path.join(tempFolder, detailsAsset.name.replace('.details.zip',''));
        zip.extractAllTo(extractPath,true);

        // Validate metadata
        const metadataFile = path.join(extractPath,'details.txt');
        if(!fs.existsSync(metadataFile)) throw new Error(`details.txt missing in ${detailsAsset.name}`);
        const { Title, Console, Creator, Year, Description } = validateMetadata(metadataFile);

        // Validate folders
        const coverPath = path.join(extractPath,'cover');
        const screenshotsPath = path.join(extractPath,'screenshots');
        if(!fs.existsSync(coverPath) || fs.readdirSync(coverPath).length===0)
            throw new Error(`Cover folder missing or empty for ${Title}`);
        if(!fs.existsSync(screenshotsPath) || fs.readdirSync(screenshotsPath).length===0)
            throw new Error(`Screenshots folder missing or empty for ${Title}`);

        // Generate HTML
        let template = fs.readFileSync(templatePath,'utf8');
        template = template.replace(/GAME_TITLE/g,Title)
                           .replace(/CONSOLE_NAME/g,Console)
                           .replace(/CREATOR_NAME/g,Creator)
                           .replace(/RELEASE_YEAR/g,Year)
                           .replace(/GAME_DESCRIPTION/g,Description)
                           .replace(/GAME_ZIP_LINK/g,gameAsset.browser_download_url)
                           .replace(/GAME_FOLDER/g,detailsAsset.name.replace('.details.zip',''));

        const gameFileName = Title.replace(/\s+/g,'-').toLowerCase() + '.html';
        fs.writeFileSync(path.join(outputFolder, gameFileName), template);

        games.push({ title: Title, console: Console, creator: Creator, year: Year, html: 'games-pages/' + gameFileName });
    }

    generateIndex(games);
}

function generateIndex(games){
    games.sort((a,b)=>b.year-a.year);

    let html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Homebrew Games - ZAG Archive</title>
<style>
/* CSS same as your previous index generation */
</style>
</head>
<body>
<header>
<div class="site-title">ZAG Archive</div>
<nav>
<a href="https://zagv2.github.io/ZAGArchive-/index.html">Home</a>
<div class="dropdown">
<button class="dropbtn">Sections ▼</button>
<div class="dropdown-content">
<a href="https://zagv2.github.io/Homebrew-Games/">Homebrew Games</a>
<a href="https://zagv2.github.io/romhacks-patches/">ROM Hacks & Patches</a>
</div></div>
<a href="https://zagv2.github.io/ZAGArchive-/about.html">About</a>
<a href="https://zagv2.github.io/ZAGArchive-/contact.html">Contact</a>
</nav>
</header>
<div class="container">
<input type="text" id="searchBar" placeholder="Search by title or console">
<div class="grid">`;

    games.slice(0,3).forEach(g=>{
        html += `<div class="card" onclick="window.location.href='${g.html}'">
<img src="../games/${g.title.replace(/\s+/g,'-').toLowerCase()}/cover/cover.jpg" alt="${g.title}">
<h3>${g.title}</h3><p>Console: ${g.console}</p></div>`;
    });

    html += `</div><table class="game-table"><thead><tr><th>Cover</th><th>Game</th><th>Console</th><th>Creator</th><th>Year</th></tr></thead><tbody>`;
    games.forEach(g=>{
        html += `<tr onclick="window.location.href='${g.html}'">
<td><img src="../games/${g.title.replace(/\s+/g,'-').toLowerCase()}/cover/cover.jpg" width="50"></td>
<td>${g.title}</td><td>${g.console}</td><td>${g.creator}</td><td>${g.year}</td></tr>`;
    });
    html += `</tbody></table></div><footer>© 2026 ZAG Archive</footer>
<script>
document.getElementById('searchBar').addEventListener('input',function(){
let val=this.value.toLowerCase();
document.querySelectorAll('.game-table tbody tr').forEach(tr=>{
let title=tr.cells[1].textContent.toLowerCase();
let console=tr.cells[2].textContent.toLowerCase();
tr.style.display=(title.includes(val)||console.includes(val))?'':'none';
});
});
</script>
</body></html>`;

    fs.writeFileSync(indexPath, html);
}

run();