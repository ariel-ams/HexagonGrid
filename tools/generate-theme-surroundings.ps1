param(
    [string]$OutputDirectory = 'assets/tiles/themes',
    [double]$WhiteTolerance = 245,
    [double]$WhiteToleranceMinSaturation = 20,
    [string[]]$Themes = @(
        'forest',
        'cave',
        'waspHive',
        'underground'
    )
)

Add-Type -AssemblyName System.Drawing

$sourceFiles = @{
    forest = 'forest-cells.png'
    cave = 'cave-cells.png'
    waspHive = 'wasp-hive-cells.png'
    underground = 'cave-cells.png'
}
$outputFiles = @{
    forest = 'forest-surroundings.png'
    cave = 'cave-surroundings.png'
    waspHive = 'wasp-hive-surroundings.png'
    underground = 'underground-surroundings.png'
}

function Invoke-KeyColorTrim {
    param(
        [string]$SourcePath,
        [string]$OutputPath,
        [double]$WhiteTolerance,
        [double]$WhiteToleranceMinSaturation
    )

    $source = New-Object System.Drawing.Bitmap($SourcePath)
    try {
        $result = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $rect = New-Object System.Drawing.Rectangle 0, 0, $source.Width, $source.Height
        $srcData = $source.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, $source.PixelFormat)
        $resData = $result.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, $result.PixelFormat)

        $srcStride = [Math]::Abs($srcData.Stride)
        $resStride = [Math]::Abs($resData.Stride)
        $srcBytes = $srcStride * $source.Height
        $resBytes = $resStride * $result.Height

        $srcBuffer = New-Object byte[] $srcBytes
        $resBuffer = New-Object byte[] $resBytes

        [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBuffer, 0, $srcBytes)

        for ($y = 0; $y -lt $source.Height; $y++) {
            for ($x = 0; $x -lt $source.Width; $x++) {
                $srcIndex = $y * $srcStride + ($x * 4)
                $b = $srcBuffer[$srcIndex]
                $g = $srcBuffer[$srcIndex + 1]
                $r = $srcBuffer[$srcIndex + 2]
                $a = $srcBuffer[$srcIndex + 3]

                $isWhite = (
                    $r -ge $WhiteTolerance -and
                    $g -ge $WhiteTolerance -and
                    $b -ge $WhiteTolerance
                )

                $max = [Math]::Max($r, [Math]::Max($g, $b))
                $min = [Math]::Min($r, [Math]::Min($g, $b))
                $saturation = $max - $min

                if ($a -eq 0 -or ($isWhite -and $saturation -le $WhiteToleranceMinSaturation)) {
                    $r = 0
                    $g = 0
                    $b = 0
                    $a = 0
                }

                $destIndex = $y * $resStride + ($x * 4)
                $resBuffer[$destIndex] = $b
                $resBuffer[$destIndex + 1] = $g
                $resBuffer[$destIndex + 2] = $r
                $resBuffer[$destIndex + 3] = $a
            }
        }

        [System.Runtime.InteropServices.Marshal]::Copy($resBuffer, 0, $resData.Scan0, $resBytes)
        $result.UnlockBits($resData)
        $source.UnlockBits($srcData)

        $result.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "[generated] $OutputPath"
    } finally {
        if ($result -ne $null) { $result.Dispose() }
        $source.Dispose()
    }
}

foreach ($theme in $Themes) {
    if (-not $sourceFiles.ContainsKey($theme)) {
        Write-Warning "No source mapping found for theme '$theme'."
        continue
    }

    $sourceFile = Join-Path $OutputDirectory $sourceFiles[$theme]
    if (-not (Test-Path -LiteralPath $sourceFile)) {
        Write-Warning "Missing source theme sheet: $sourceFile"
        continue
    }

    $outputFile = Join-Path $OutputDirectory $outputFiles[$theme]
    Invoke-KeyColorTrim -SourcePath $sourceFile -OutputPath $outputFile -WhiteTolerance $WhiteTolerance -WhiteToleranceMinSaturation $WhiteToleranceMinSaturation
}
