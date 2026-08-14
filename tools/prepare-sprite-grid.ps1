param(
    [string]$ManifestPath = 'assets/style-sources/lamp-style-core/manifest.json',
    [int]$MinBrightness = 180,
    [int]$MaxChroma = 30
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not ('HoneycombSpriteGrid' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class HoneycombSpriteGrid
{
    public static void Prepare(
        string inputPath,
        string outputPath,
        int columns,
        int rows,
        int frameSize,
        int[] rowMap,
        int minBrightness,
        int maxChroma)
    {
        using (var source = new Bitmap(inputPath))
        using (var cleaned = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
        {
            using (var graphics = Graphics.FromImage(cleaned))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.DrawImageUnscaled(source, 0, 0);
            }

            RemoveConnectedNeutralBackground(cleaned, minBrightness, maxChroma);

            var rowEdges = GetRowEdges(cleaned, rows);
            var bounds = new Rectangle[rows, columns];
            var maxWidth = 0;
            var maxHeight = 0;
            for (var row = 0; row < rows; row++)
            {
                for (var column = 0; column < columns; column++)
                {
                    var cell = GetSourceCell(cleaned, column, row, columns, rowEdges);
                    var visible = GetVisibleBounds(cleaned, cell);
                    if (visible.Width <= 0 || visible.Height <= 0)
                    {
                        throw new InvalidOperationException(string.Format("No visible sprite pixels in source frame {0},{1}: {2}", column, row, inputPath));
                    }
                    bounds[row, column] = visible;
                    maxWidth = Math.Max(maxWidth, visible.Width);
                    maxHeight = Math.Max(maxHeight, visible.Height);
                }
            }

            var targetContentSize = frameSize * 0.82f;
            var scale = Math.Min(targetContentSize / maxWidth, targetContentSize / maxHeight);
            using (var result = new Bitmap(columns * frameSize, rows * frameSize, PixelFormat.Format32bppArgb))
            using (var graphics = Graphics.FromImage(result))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceOver;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
                graphics.SmoothingMode = SmoothingMode.HighQuality;

                for (var targetRow = 0; targetRow < rows; targetRow++)
                {
                    var sourceRow = rowMap != null && targetRow < rowMap.Length ? rowMap[targetRow] : targetRow;
                    if (sourceRow < 0 || sourceRow >= rows)
                    {
                        throw new InvalidOperationException(string.Format("Invalid row map value {0} for {1}", sourceRow, inputPath));
                    }

                    for (var column = 0; column < columns; column++)
                    {
                        var sourceBounds = bounds[sourceRow, column];
                        var targetWidth = Math.Max(1, (int)Math.Round(sourceBounds.Width * scale));
                        var targetHeight = Math.Max(1, (int)Math.Round(sourceBounds.Height * scale));
                        var targetX = column * frameSize + (frameSize - targetWidth) / 2;
                        var targetY = targetRow * frameSize + (frameSize - targetHeight) / 2;
                        graphics.DrawImage(
                            cleaned,
                            new Rectangle(targetX, targetY, targetWidth, targetHeight),
                            sourceBounds,
                            GraphicsUnit.Pixel);
                    }
                }

                var directory = Path.GetDirectoryName(outputPath);
                if (!string.IsNullOrEmpty(directory)) Directory.CreateDirectory(directory);
                result.Save(outputPath, ImageFormat.Png);
            }
        }
    }

    private static Rectangle GetSourceCell(Bitmap image, int column, int row, int columns, int[] rowEdges)
    {
        var left = (int)Math.Round(column * image.Width / (double)columns);
        var right = (int)Math.Round((column + 1) * image.Width / (double)columns);
        var top = rowEdges[row];
        var bottom = rowEdges[row + 1];
        return Rectangle.FromLTRB(left, top, right, bottom);
    }

    private static int[] GetRowEdges(Bitmap image, int rows)
    {
        var edges = new int[rows + 1];
        edges[0] = 0;
        edges[rows] = image.Height;
        if (rows == 1) return edges;

        var gaps = new List<int[]>();
        var lastOccupied = -1;
        for (var y = 0; y < image.Height; y++)
        {
            var occupied = false;
            for (var x = 0; x < image.Width; x++)
            {
                if (image.GetPixel(x, y).A > 10)
                {
                    occupied = true;
                    break;
                }
            }

            if (!occupied) continue;
            if (lastOccupied >= 0 && y - lastOccupied > 1)
            {
                gaps.Add(new[] { lastOccupied + 1, y - 1, y - lastOccupied - 1 });
            }
            lastOccupied = y;
        }

        gaps.Sort((left, right) => right[2].CompareTo(left[2]));
        var boundaries = new List<int>();
        for (var index = 0; index < gaps.Count && boundaries.Count < rows - 1; index++)
        {
            boundaries.Add((gaps[index][0] + gaps[index][1] + 1) / 2);
        }

        if (boundaries.Count != rows - 1)
        {
            for (var row = 1; row < rows; row++)
            {
                edges[row] = (int)Math.Round(row * image.Height / (double)rows);
            }
            return edges;
        }

        boundaries.Sort();
        for (var row = 1; row < rows; row++) edges[row] = boundaries[row - 1];
        return edges;
    }

    private static Rectangle GetVisibleBounds(Bitmap image, Rectangle cell)
    {
        var minX = cell.Right;
        var minY = cell.Bottom;
        var maxX = cell.Left - 1;
        var maxY = cell.Top - 1;
        for (var y = cell.Top; y < cell.Bottom; y++)
        {
            for (var x = cell.Left; x < cell.Right; x++)
            {
                if (image.GetPixel(x, y).A <= 10) continue;
                minX = Math.Min(minX, x);
                minY = Math.Min(minY, y);
                maxX = Math.Max(maxX, x);
                maxY = Math.Max(maxY, y);
            }
        }
        return maxX < minX || maxY < minY
            ? Rectangle.Empty
            : Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
    }

    private static void RemoveConnectedNeutralBackground(Bitmap image, int minBrightness, int maxChroma)
    {
        var visited = new bool[image.Width * image.Height];
        var queue = new Queue<Point>();
        Action<int, int> enqueue = (x, y) =>
        {
            if (x < 0 || y < 0 || x >= image.Width || y >= image.Height) return;
            var index = y * image.Width + x;
            if (visited[index]) return;
            visited[index] = true;
            var color = image.GetPixel(x, y);
            if (color.A == 0) return;
            var max = Math.Max(color.R, Math.Max(color.G, color.B));
            var min = Math.Min(color.R, Math.Min(color.G, color.B));
            if (max >= minBrightness && max - min <= maxChroma) queue.Enqueue(new Point(x, y));
        };

        for (var x = 0; x < image.Width; x++)
        {
            enqueue(x, 0);
            enqueue(x, image.Height - 1);
        }
        for (var y = 0; y < image.Height; y++)
        {
            enqueue(0, y);
            enqueue(image.Width - 1, y);
        }

        while (queue.Count > 0)
        {
            var point = queue.Dequeue();
            image.SetPixel(point.X, point.Y, Color.Transparent);
            enqueue(point.X + 1, point.Y);
            enqueue(point.X - 1, point.Y);
            enqueue(point.X, point.Y + 1);
            enqueue(point.X, point.Y - 1);
        }
    }
}
'@
}

$resolvedManifest = (Resolve-Path -LiteralPath $ManifestPath).Path
$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path (Split-Path -Parent $resolvedManifest) '..\..\..')).Path
$manifest = Get-Content -LiteralPath $resolvedManifest -Raw | ConvertFrom-Json

foreach ($asset in $manifest.assets) {
    $inputPath = (Resolve-Path -LiteralPath (Join-Path $repositoryRoot $asset.sourcePath)).Path
    $outputPath = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot $asset.runtimePath))
    $rowMap = if ($asset.rowMap) { [int[]]$asset.rowMap } else { [int[]](0..([int]$asset.rows - 1)) }
    [HoneycombSpriteGrid]::Prepare(
        $inputPath,
        $outputPath,
        [int]$asset.columns,
        [int]$asset.rows,
        [int]$asset.frameSize,
        $rowMap,
        $MinBrightness,
        $MaxChroma)
    Write-Output "Prepared $($asset.id): $($asset.runtimePath)"
}
