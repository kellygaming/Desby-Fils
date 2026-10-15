# Découpe une vidéo en images JPEG numérotées pour le lecteur au scroll
# Utilisation : decouper.ps1 -Video clip.mp4 -Sortie assets\seq\maison -Images 120 -Largeur 1280
param([string]$Video, [string]$Sortie, [int]$Images = 120, [int]$Largeur = 1280, [int]$Qualite = 72)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Editing.MediaComposition, Windows.Media.Editing, ContentType = WindowsRuntime]
$null = [Windows.Media.Editing.MediaClip, Windows.Media.Editing, ContentType = WindowsRuntime]

$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, [Type]$t) { $task = $asTask.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait(-1) | Out-Null; $task.Result }

$fichier = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path $Video).Path)) ([Windows.Storage.StorageFile])
$clip = Await ([Windows.Media.Editing.MediaClip]::CreateFromFileAsync($fichier)) ([Windows.Media.Editing.MediaClip])
$comp = New-Object Windows.Media.Editing.MediaComposition
[System.Collections.Generic.ICollection[Windows.Media.Editing.MediaClip]].GetMethod('Add').Invoke($comp.Clips, @($clip))
$p = $clip.GetVideoEncodingProperties()
$w = [int]$p.Width; $h = [int]$p.Height
$lw = [Math]::Min($Largeur, $w); $lh = [int]([Math]::Round($h * $lw / $w / 2) * 2)

New-Item -ItemType Directory -Force $Sortie | Out-Null
Get-ChildItem $Sortie -Filter *.jpg | Remove-Item -Confirm:$false
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$Qualite)
$dur = $comp.Duration.Ticks
for ($i = 0; $i -lt $Images; $i++) {
  # on reste légèrement avant la toute fin pour éviter une image noire
  $t = [TimeSpan]::FromTicks([long](($dur - 400000) * $i / ($Images - 1)))
  $flux = Await ($comp.GetThumbnailAsync($t, $lw, $lh, [Windows.Media.Editing.VideoFramePrecision]::NearestFrame)) ([Windows.Graphics.Imaging.ImageStream])
  $net = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($flux)
  $img = [System.Drawing.Image]::FromStream($net)
  $img.Save((Join-Path (Resolve-Path $Sortie) ('{0:D4}.jpg' -f ($i + 1))), $codec, $ep)
  $img.Dispose(); $net.Dispose()
}
$taille = (Get-ChildItem $Sortie -Filter *.jpg | Measure-Object Length -Sum).Sum / 1MB
"{0} images {1}x{2} -> {3} ({4:N1} Mo) ; video {5}x{6}, {7:N1} s" -f $Images, $lw, $lh, $Sortie, $taille, $w, $h, ($dur / 1e7)
