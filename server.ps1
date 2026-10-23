$port = 8080
$folder = $PSScriptRoot

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$listener.Start()

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Web server da san sang tai: http://localhost:$port" -ForegroundColor Cyan
Write-Host " Nhan Ctrl+C de dung server." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green

# Open browser
Start-Process "http://localhost:$port"

while ($listener.Server.IsBound) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()
        
        if ($requestLine) {
            $tokens = $requestLine.Split(" ")
            $path = $tokens[1]
            if ($path -eq "/" -or [string]::IsNullOrWhiteSpace($path)) {
                $path = "/index.html"
            }
            # Remove query string
            if ($path.Contains("?")) {
                $path = $path.Substring(0, $path.IndexOf("?"))
            }

            $localPath = Join-Path $folder ($path.TrimStart("/").Replace("/", "\"))
            
            if (Test-Path $localPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                $contentType = "text/plain; charset=utf-8"
                switch ($ext) {
                    ".html" { $contentType = "text/html; charset=utf-8" }
                    ".css"  { $contentType = "text/css; charset=utf-8" }
                    ".js"   { $contentType = "application/javascript; charset=utf-8" }
                    ".json" { $contentType = "application/json; charset=utf-8" }
                    ".png"  { $contentType = "image/png" }
                    ".jpg"  { $contentType = "image/jpeg" }
                    ".svg"  { $contentType = "image/svg+xml" }
                    ".ico"  { $contentType = "image/x-icon" }
                }

                $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($bytes, 0, $bytes.Length)
            } else {
                $notFound = "HTTP/1.1 404 Not Found`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
                $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($notFound)
                $stream.Write($notFoundBytes, 0, $notFoundBytes.Length)
            }
        }
        $stream.Flush()
        $client.Close()
    } catch {
        # Continue on client disconnect
    }
}
