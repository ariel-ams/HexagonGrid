param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,
    [int]$MinBrightness = 180,
    [int]$MaxChroma = 30
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not ('HoneycombSpriteAlpha' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

public static class HoneycombSpriteAlpha
{
    public static void RemoveConnectedBackground(string inputPath, string outputPath, int minBrightness, int maxChroma)
    {
        using (var source = new Bitmap(inputPath))
        using (var result = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
        {
            using (var graphics = Graphics.FromImage(result))
            {
                graphics.DrawImageUnscaled(source, 0, 0);
            }

            var visited = new bool[result.Width * result.Height];
            var queue = new Queue<Point>();

            Action<int, int> enqueue = (x, y) =>
            {
                if (x < 0 || y < 0 || x >= result.Width || y >= result.Height) return;
                var index = y * result.Width + x;
                if (visited[index]) return;
                visited[index] = true;
                var color = result.GetPixel(x, y);
                var max = Math.Max(color.R, Math.Max(color.G, color.B));
                var min = Math.Min(color.R, Math.Min(color.G, color.B));
                if (max >= minBrightness && max - min <= maxChroma) queue.Enqueue(new Point(x, y));
            };

            for (var x = 0; x < result.Width; x++)
            {
                enqueue(x, 0);
                enqueue(x, result.Height - 1);
            }
            for (var y = 0; y < result.Height; y++)
            {
                enqueue(0, y);
                enqueue(result.Width - 1, y);
            }

            while (queue.Count > 0)
            {
                var point = queue.Dequeue();
                result.SetPixel(point.X, point.Y, Color.Transparent);
                enqueue(point.X + 1, point.Y);
                enqueue(point.X - 1, point.Y);
                enqueue(point.X, point.Y + 1);
                enqueue(point.X, point.Y - 1);
            }

            var directory = Path.GetDirectoryName(outputPath);
            if (!string.IsNullOrEmpty(directory)) Directory.CreateDirectory(directory);
            result.Save(outputPath, ImageFormat.Png);
        }
    }
}
'@
}

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
[HoneycombSpriteAlpha]::RemoveConnectedBackground($resolvedInput, $resolvedOutput, $MinBrightness, $MaxChroma)
Write-Output "Generated transparent sprite: $resolvedOutput"
