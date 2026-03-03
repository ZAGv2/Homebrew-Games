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

fs.mkdirSync(outputFolder, { recursive: true });

async function run() {
  const releases = await octokit.repos.listReleases({ owner, repo });
  const games = [];

  for(const release of releases.data){
    const gameAsset = release.assets.find(a => !a.name.endsWith('.details.zip'));
    const detailsAsset = release.assets.find(a => a.name.endsWith('.details.zip'));
    if(!gameAsset || !detailsAsset) continue;

    const tempZip = path.join(__dirname,'temp',detailsAsset.name);
    fs.mkdirSync(path.dirname(tempZip),{recursive:true});
    const res = await fetch(detailsAsset.browser_download_url);
    const buffer = await res.buffer();
    fs.writeFileSync(tempZip, buffer);

    const zip = new AdmZip(tempZip);
    const extractPath = path.join(__dirname,'temp',detailsAsset.name.replace('.details.zip',''));
    zip.extractAllTo(extractPath,true);

    const [GAME_TITLE, CONSOLE_NAME, CREATOR_NAME, RELEASE_YEAR, GAME_DESCRIPTION] =
      fs.readFileSync(path.join(extractPath,'details.txt'),'utf8').split('\n');

    let template = fs.readFileSync(templatePath,'utf8');
    template = template.replace(/GAME_TITLE/g,GAME_TITLE)
                       .replace(/CONSOLE_NAME/g,CONSOLE_NAME)
                       .replace(/CREATOR_NAME/g,CREATOR_NAME)
                       .replace(/RELEASE_YEAR/g,RELEASE_YEAR)
                       .replace(/GAME_DESCRIPTION/g,GAME_DESCRIPTION)
                       .replace(/GAME_ZIP_LINK/g,gameAsset.browser_download_url)
                       .replace(/GAME_FOLDER/g,detailsAsset.name.replace('.details.zip',''));

    const gameFileName = GAME_TITLE.replace(/\s+/g,'-').toLowerCase() + '.html';
    fs.writeFileSync(path.join(outputFolder, gameFileName), template);

    games.push({
      title: GAME_TITLE,
      console: CONSOLE_NAME,
      creator: CREATOR_NAME,
      year: RELEASE_YEAR,
      html: 'games-pages/' + gameFileName
    });
  }

  generateIndex(games);
}

function generateIndex(games){
  games.sort((a,b)=>b.year-a.year);

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Homebrew Games - ZAG Archive</title>
<style>
body{margin:0;font-family:'Segoe UI',sans-serif;background:#f0f2f5;color:#222;}
header{background:#fff;padding:15px 30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 6px rgba(0,0,0,0.1);flex-wrap:wrap;}
.site-title{font-weight:700;font-size:20px;color:#1e90ff;text-transform:uppercase;}
nav{display:flex;flex-wrap:wrap;}
nav a{margin-left:20px;text-decoration:none;color:#333;font-weight:600;}
nav a:hover{color:#1e90ff;}
.dropdown{position:relative;}
.dropbtn{margin-left:20px;font-weight:600;background:none;border:none;cursor:pointer;color:#333;font-size:16px;}
.dropdown-content{display:none;position:absolute;background:#fff;min-width:200px;box-shadow:0 4px 8px rgba(0,0,0,0.1);border-radius:6px;margin-top:8px;overflow:hidden;}
.dropdown-content a{display:block;padding:10px 15px;text-decoration:none;color:#333;}
.dropdown-content a:hover{background:#f0f8ff;color:#1e90ff;}
.dropdown:hover .dropdown-content{display:block;}
.container{max-width:1100px;margin:40px auto;padding:0 20px;}
input#searchBar{width:100%;max-width:400px;padding:8px 12px;margin-bottom:20px;border-radius:6px;border:1px solid #ccc;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;margin-bottom:30px;}
.card{background:#fff;padding:15px;border-radius:12px;text-align:center;box-shadow:0 6px 12px rgba(0,0,0,0.08);cursor:pointer;transition:0.3s;}
.card img{width:100%;border-radius:10px;margin-bottom:10px;}
.card h3{color:#1e90ff;font-size:18px;margin-bottom:5px;}
.card p{font-size:14px;color:#555;}
.game-table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 12px rgba(0,0,0,0.08);margin-bottom:50px;}
.game-table th,.game-table td{padding:12px 10px;border-bottom:1px solid #ddd;font-size:14px;text-align:left;}
.game-table th{background:#f7f7f7;color:#1e90ff;}
.game-table tr:hover{background:#f0f8ff;cursor:pointer;}
footer{background:#fff;padding:25px;text-align:center;border-top:1px solid #ddd;color:#555;font-size:14px;}
@media(max-width:768px){input#searchBar{max-width:100%;} .grid{grid-template-columns:1fr;}}
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
</div>
</div>
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
<h3>${g.title}</h3>
<p>Console: ${g.console}</p></div>`;
  });

  html += `</div><table class="game-table"><thead><tr><th>Cover</th><th>Game</th><th>Console</th><th>Creator</th><th>Year</th></tr></thead><tbody>`;
  games.forEach(g=>{
    html += `<tr onclick="window.location.href='${g.html}'">
<td><img src="../games/${g.title.replace(/\s+/g,'-').toLowerCase()}/cover/cover.jpg" width="50"></td>
<td>${g.title}</td><td>${g.console}</td><td>${g.creator}</td><td>${g.year}</td>
</tr>`;
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
