$ErrorActionPreference = 'Stop'
$base = $PSScriptRoot
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw 'Install Node.js to replay this saved site, then double-click Replay.cmd again.' }
$expected = Get-Content -Raw -LiteralPath (Join-Path $base 'replays/manifest.json') | ConvertFrom-Json
$chosen = $null
foreach ($candidate in 8012..8022) {
  try {
    $manifest = Invoke-RestMethod -Uri "http://127.0.0.1:$candidate/replays/manifest.json" -TimeoutSec 1
    if ($manifest.project -eq 'Portals: Beyond' -and $manifest.savedAt -eq $expected.savedAt) { $chosen = $candidate; break }
  } catch {
    $listener = Get-NetTCPConnection -LocalPort $candidate -State Listen -ErrorAction SilentlyContinue
    if (-not $listener) { $chosen = $candidate; break }
  }
}
if (-not $chosen) { throw 'No free replay port was found between 8012 and 8022.' }
$uri = "http://127.0.0.1:$chosen/replays/"
try { $null = Invoke-WebRequest "$uri/manifest.json" -TimeoutSec 1 } catch {
  Start-Process -FilePath $node.Source -ArgumentList @('tools/serve.mjs', '.', "$chosen") -WorkingDirectory $base -WindowStyle Hidden
  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try { $null = Invoke-WebRequest "$uri/manifest.json" -TimeoutSec 1; break } catch { Start-Sleep -Milliseconds 250 }
  }
}
Start-Process $uri
