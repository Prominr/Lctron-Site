param(
    [string]$Email  = "theunthinkable234@gmail.com",
    [switch]$Revoke = $false
)

$url  = "https://lctronoptimizer.netlify.app/.netlify/functions/grant-premium"
$body = @{
    owner  = "omariirvin44@gmail.com"
    email  = $Email
    revoke = [bool]$Revoke
} | ConvertTo-Json

Write-Host "$(if ($Revoke) { 'Revoking' } else { 'Granting' }) premium for: $Email"

$response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
Write-Host "Response: $($response | ConvertTo-Json)"

Write-Host "Verifying..."
$check = Invoke-RestMethod -Uri "https://lctronoptimizer.netlify.app/.netlify/functions/check-premium?email=$([Uri]::EscapeDataString($Email))"
Write-Host "Premium status: $($check.premium)"
