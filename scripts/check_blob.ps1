$token  = "nfc_m5cd3qFAreBLtmaPzuJTN3NgD65eBWqz7686"
$siteId = "ab849e15-836d-4b57-9c2f-347b58a40b78"
$email  = "theunthinkable234@gmail.com"
$store  = "premium-users"

$headers = @{ Authorization = "Bearer $token" }

# Read blob
$blobUrl = "https://api.netlify.com/api/v1/blobs/$siteId/$store/$([Uri]::EscapeDataString($email))"
Write-Host "Reading: $blobUrl"
try {
    $resp = Invoke-WebRequest -Uri $blobUrl -Headers $headers -UseBasicParsing
    Write-Host "Status: $($resp.StatusCode)"
    Write-Host "Body: '$($resp.Content)'"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}

# Also set NETLIFY_API_TOKEN env var on the site
Write-Host "`nSetting NETLIFY_API_TOKEN env var on site..."
$envBody = @(
    @{
        key    = "NETLIFY_API_TOKEN"
        values = @{ production = $token }
    },
    @{
        key    = "NETLIFY_SITE_ID"
        values = @{ production = $siteId }
    }
) | ConvertTo-Json -Depth 5

$envResp = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$siteId/env" `
    -Method POST `
    -Body $envBody `
    -ContentType "application/json" `
    -Headers $headers
Write-Host "Env set response: $($envResp | ConvertTo-Json -Depth 3)"
