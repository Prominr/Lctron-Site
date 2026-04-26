$email = "theunthinkable234@gmail.com"
$enc   = [Uri]::EscapeDataString($email)

# Test public blob endpoint
$url = "https://lctronoptimizer.netlify.app/.netlify/blobs/premium-users/$enc"
Write-Host "Testing: $url"
try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing
    Write-Host "Status: $($resp.StatusCode)"
    Write-Host "Body: '$($resp.Content)'"
} catch {
    Write-Host "Error $($_.Exception.Response.StatusCode.value__): $($_.Exception.Message)"
}
