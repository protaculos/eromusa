Write-Host "Matando processos git travados..."
Get-Process git* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

Write-Host "Stage, commit e push..."
Set-Location "C:\Users\prota\OneDrive\Desktop\Ero Musa"
git add -A
git commit -m "feat: instant credit UI updates via local sessionStorage + addCredits/deductCredits"
git push

Write-Host "Deploy realizado com sucesso!"
Read-Host "Pressione Enter para sair"
