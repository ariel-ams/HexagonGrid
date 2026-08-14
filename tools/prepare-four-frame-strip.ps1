param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,
    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$source = New-Object System.Drawing.Bitmap((Resolve-Path -LiteralPath $InputPath).Path)
try {
    if ($source.Width % 4 -ne 0) {
        throw "Sprite source width must divide evenly into four frames: $($source.Width)"
    }

    $frameSize = [int]($source.Width / 4)
    if ($source.Height -lt $frameSize) {
        throw "Sprite source is not tall enough for square frames: $($source.Width)x$($source.Height)"
    }

    $minY = $source.Height
    $maxY = 0
    for ($y = 0; $y -lt $source.Height; $y++) {
        for ($x = 0; $x -lt $source.Width; $x++) {
            if ($source.GetPixel($x, $y).A -gt 10) {
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    if ($minY -gt $maxY) {
        throw 'Sprite source has no visible pixels.'
    }

    $contentCenter = ($minY + $maxY) / 2
    $cropY = [Math]::Round($contentCenter - ($frameSize / 2))
    $cropY = [Math]::Max(0, [Math]::Min($source.Height - $frameSize, $cropY))

    $result = New-Object System.Drawing.Bitmap($source.Width, $frameSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $graphics = [System.Drawing.Graphics]::FromImage($result)
        try {
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $destination = New-Object System.Drawing.Rectangle 0, 0, $result.Width, $result.Height
            $graphics.DrawImage($source, $destination, 0, $cropY, $source.Width, $frameSize, [System.Drawing.GraphicsUnit]::Pixel)
        } finally {
            $graphics.Dispose()
        }

        $resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
        $directory = [System.IO.Path]::GetDirectoryName($resolvedOutput)
        if ($directory) { [System.IO.Directory]::CreateDirectory($directory) | Out-Null }
        $result.Save($resolvedOutput, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Prepared four-frame sprite: $resolvedOutput ($($result.Width)x$($result.Height))"
    } finally {
        $result.Dispose()
    }
} finally {
    $source.Dispose()
}
