# Petit serveur local pour prévisualiser le site (aucune installation nécessaire)
param([int]$Port = 8080, [string]$Racine = (Split-Path $PSScriptRoot -Parent))
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css'; '.js'='application/javascript'; '.svg'='image/svg+xml';
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.png'='image/png'; '.webp'='image/webp'; '.mp4'='video/mp4'; '.json'='application/json'; '.ico'='image/x-icon' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Site sur http://localhost:$Port/"
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $chemin = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
    if ($chemin -eq '' -or $chemin.EndsWith('/')) { $chemin += 'index.html' }
    $f = Join-Path $Racine $chemin
    if ((Test-Path $f -PathType Leaf) -and ([IO.Path]::GetFullPath($f).StartsWith([IO.Path]::GetFullPath($Racine)))) {
      $o = [IO.File]::ReadAllBytes($f)
      $ext = [IO.Path]::GetExtension($f).ToLower()
      $c.Response.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
      $c.Response.Headers.Add('Cache-Control', 'no-cache')
      $c.Response.ContentLength64 = $o.Length
      $c.Response.OutputStream.Write($o, 0, $o.Length)
    } else { $c.Response.StatusCode = 404 }
  } catch { $c.Response.StatusCode = 500 } finally { $c.Response.Close() }
}
