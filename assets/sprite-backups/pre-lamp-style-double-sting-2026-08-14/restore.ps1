$ErrorActionPreference = 'Stop'
$backupRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $backupRoot '..\..\..'))
$source = Join-Path $backupRoot 'assets\sting-alpha.png'
$target = Join-Path $repositoryRoot 'assets\sting-alpha.png'
if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot 'index.html'))) { throw "Expected Honeycomb Wayfinder repository at $repositoryRoot" }
if (-not (Test-Path -LiteralPath $source)) { throw "Backup sprite missing: $source" }
Copy-Item -LiteralPath $source -Destination $target -Force
Write-Output 'Restored assets/sting-alpha.png'
