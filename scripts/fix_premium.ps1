param(
    [string]$Email = "theunthinkable234@gmail.com"
)

$token = "nfc_m5cd3qFAreBLtmaPzuJTN3NgD65eBWqz7686"
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# 1. Find the lctronoptimizer site
Write-Host "Finding site..."
$sites = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites?filter=owner" -Headers $headers
$site = $sites | Where-Object { $_.name -like "*lctron*" -or $_.default_domain -like "*lctron*" } | Select-Object -First 1

if (-not $site) {
    Write-Host "Sites found:"
    $sites | ForEach-Object { Write-Host "  $($_.name) -> $($_.default_domain)" }
    Write-Error "Could not find lctronoptimizer site"
    exit 1
}

$siteId = $site.id
Write-Host "Site: $($site.name) | ID: $siteId"

# 2. Write to Netlify Blobs store via the REST API
$blobUrl = "https://api.netlify.com/api/v1/blobs/$siteId/premium-users/$([Uri]::EscapeDataString($Email.ToLower().Trim()))"
Write-Host "Writing blob for: $Email"

$blobHeaders = @{
    Authorization  = "Bearer $token"
    "Content-Type" = "text/plain; charset=utf-8"
}
$blobResp = Invoke-RestMethod -Uri $blobUrl -Method PUT -Body "true" -Headers $blobHeaders
Write-Host "Blob write response: $($blobResp | ConvertTo-Json -Depth 3)"

# 3. Verify — read back
Write-Host "Verifying..."
$check = Invoke-RestMethod -Uri "https://lctronoptimizer.netlify.app/.netlify/functions/check-premium?email=$([Uri]::EscapeDataString($Email))"
Write-Host "Premium status for ${Email}: $($check.premium)"
