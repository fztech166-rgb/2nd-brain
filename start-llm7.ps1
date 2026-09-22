# Start LLM7 Relay Proxy + Codex
$env:CODEX_RELAY_API_KEY = "Ng7dkoPoxqdJmrwyoeKzeBBveACkZX0wCrHtSWpScQsRckm3UMTJJtBy7nqq9mEAvUMzKMYi376vpTYQ60vLIa3GNER/wi7U3WFJEcf3+CUi/m9I1J+aBMFUgGSveQ7NAi1oRX36/GKkkTdX"

Write-Host "Starting codex-relay proxy on port 11434..." -ForegroundColor Cyan
Start-Process -FilePath "C:\Users\SAMSUNG\AppData\Roaming\Python\Python314\Scripts\codex-relay.exe" -ArgumentList "--port 11434 --upstream https://api.llm7.io/v1" -NoNewWindow

Start-Sleep -Seconds 2
Write-Host "Proxy running! Now starting Codex..." -ForegroundColor Green
codex
