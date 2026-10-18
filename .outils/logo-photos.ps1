# Pose le logo Desby & Fils en bas à droite des photos et les allège pour le web.
# Utilisation : logo-photos.ps1 -Liste liste.csv   (colonnes : source;destination)
param([string]$Liste, [string]$Logo = "$PSScriptRoot\logo.png", [int]$Max = 1600, [int]$Qualite = 82)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$logoImg = [System.Drawing.Image]::FromFile((Resolve-Path $Logo).Path)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$Qualite)

foreach ($l in (Import-Csv $Liste -Delimiter ';')) {
  $src = [System.Drawing.Image]::FromFile((Resolve-Path $l.source).Path)
  # respecter l'orientation EXIF des photos de téléphone
  if ($src.PropertyIdList -contains 274) {
    switch ([int]$src.GetPropertyItem(274).Value[0]) {
      3 { $src.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
      6 { $src.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
      8 { $src.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
    }
  }
  $s = [Math]::Min(1.0, $Max / [Math]::Max($src.Width, $src.Height))
  $w = [int]($src.Width * $s); $h = [int]($src.Height * $s)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'AntiAlias'; $g.PixelOffsetMode = 'HighQuality'
  $g.DrawImage($src, 0, 0, $w, $h)
  # logo : environ 15 % du petit côté, marge de 2,5 %
  $t = [int][Math]::Max(72, [Math]::Min($w, $h) * 0.15)
  $m = [int]([Math]::Min($w, $h) * 0.025)
  $x = $w - $t - $m; $y = $h - $t - $m
  $ombre = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(60, 0, 0, 0))
  $g.FillEllipse($ombre, $x + 2, $y + 4, $t, $t)
  $attr = New-Object System.Drawing.Imaging.ImageAttributes
  $cm = New-Object System.Drawing.Imaging.ColorMatrix; $cm.Matrix33 = 0.94
  $attr.SetColorMatrix($cm)
  $g.DrawImage($logoImg, (New-Object System.Drawing.Rectangle $x, $y, $t, $t), 0, 0, $logoImg.Width, $logoImg.Height, 'Pixel', $attr)
  $dest = $l.destination
  New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
  $bmp.Save($dest, $codec, $ep)
  $g.Dispose(); $bmp.Dispose(); $src.Dispose()
  "{0}  {1}x{2}  {3:N0} Ko" -f $dest, $w, $h, ((Get-Item $dest).Length / 1KB)
}
$logoImg.Dispose()
