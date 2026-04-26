$token  = "nfc_m5cd3qFAreBLtmaPzuJTN3NgD65eBWqz7686"
$siteId = "ab849e15-836d-4b57-9c2f-347b58a40b78"
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# Get account ID
$accounts = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/accounts" -Headers $headers
$accountId = $accounts[0].id
Write-Host "Account ID: $accountId"

# Set env vars scoped to this site
$envVars = @(
    @{
        key    = "NETLIFY_API_TOKEN"
        values = @(@{ context = "all"; value = $token })
        scopes = @("functions", "runtime")
        site_id = $siteId
    },
    @{
        key    = "NETLIFY_SITE_ID"
        values = @(@{ context = "all"; value = $siteId })
        scopes = @("functions", "runtime")
        site_id = $siteId
    }
) | ConvertTo-Json -Depth 6

$resp = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/accounts/$accountId/env" `
    -Method POST -Body $envVars -Headers $headers
Write-Host "Env vars set: $($resp | ConvertTo-Json -Depth 3)"
