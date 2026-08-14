param()

$ErrorActionPreference = 'Stop'

$backupRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $backupRoot '..\..\..'))
$expectedPackage = Join-Path $repositoryRoot 'package.json'

if (-not (Test-Path -LiteralPath $expectedPackage)) {
    throw "Could not locate the Honeycomb Wayfinder repository from $backupRoot"
}

$paths = @(
    'assets/bee-alpha.png',
    'assets/pollen-alpha.png',
    'assets/water_drop-alpha.png',
    'assets/shield-alpha.png',
    'assets/entry-alpha.png',
    'assets/exit-alpha.png',
    'assets/waxDoor.png',
    'assets/thornBeetle-alpha.png',
    'assets/enemies/crawling-fire-alpha.png',
    'assets/effects/burning-cell-alpha.png'
)

foreach ($relativePath in $paths) {
    $source = Join-Path $backupRoot $relativePath
    $destination = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $source)) {
        throw "Backup file is missing: $source"
    }

    $destinationDirectory = Split-Path -Parent $destination
    [System.IO.Directory]::CreateDirectory($destinationDirectory) | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
    Write-Output "Restored $relativePath"
}

Write-Output 'Core runtime sprites restored. Run npm test before committing the restoration.'
