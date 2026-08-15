$ErrorActionPreference = 'Stop'
$backupRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $backupRoot '..\..\..'))
$source = Join-Path $backupRoot 'assets\guardWasp.png'
$target = Join-Path $repositoryRoot 'assets\guardWasp.png'
if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot 'index.html'))) { throw "Expected Honeycomb Wayfinder repository at $repositoryRoot" }
Copy-Item -LiteralPath $source -Destination $target -Force
Write-Output 'Restored assets/guardWasp.png'
