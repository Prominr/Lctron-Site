$token  = "nfc_m5cd3qFAreBLtmaPzuJTN3NgD65eBWqz7686"
$siteId = "ab849e15-836d-4b57-9c2f-347b58a40b78"
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

$body = @{
    build_settings = @{
        env = @{
            NETLIFY_API_TOKEN = $token
            NETLIFY_SITE_ID   = $siteId
        }
    }
} | ConvertTo-Json -Depth 5

$resp = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$siteId" `
    -Method PATCH -Body $body -Headers $headers
Write-Host "Done. Site env vars updated."
Write-Host "Env keys set: $($resp.build_settings.env.PSObject.Properties.Name -join ', ')"
