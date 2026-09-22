@echo off
title LLM7 Relay for Codex
set CODEX_RELAY_API_KEY=Ng7dkoPoxqdJmrwyoeKzeBBveACkZX0wCrHtSWpScQsRckm3UMTJJtBy7nqq9mEAvUMzKMYi376vpTYQ60vLIa3GNER/wi7U3WFJEcf3+CUi/m9I1J+aBMFUgGSveQ7NAi1oRX36/GKkkTdX
echo Starting codex-relay proxy on port 11434...
start "" "C:\Users\SAMSUNG\AppData\Roaming\Python\Python314\Scripts\codex-relay.exe" --port 11434 --upstream "https://api.llm7.io/v1"
timeout /t 3 /nobreak >nul
echo Proxy running! Starting Codex...
codex
