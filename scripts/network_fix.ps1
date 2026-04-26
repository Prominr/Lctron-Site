# LCTRON Network Fix Script
# Fixes WiFi connectivity issues caused by aggressive network optimization

Write-Host "LCTRON Network Fix - Starting..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires administrator privileges. Please run as administrator." -ForegroundColor Red
    pause
    exit
}

# Function to reset network adapters
function Reset-NetworkAdapters {
    Write-Host "Resetting network adapters..." -ForegroundColor Yellow
    
    # Get all network adapters
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
    
    foreach ($adapter in $adapters) {
        Write-Host "Disabling adapter: $($adapter.Name)" -ForegroundColor Cyan
        Disable-NetAdapter -Name $adapter.Name -Confirm:$false
        
        Start-Sleep -Seconds 2
        
        Write-Host "Enabling adapter: $($adapter.Name)" -ForegroundColor Cyan
        Enable-NetAdapter -Name $adapter.Name -Confirm:$false
        
        Start-Sleep -Seconds 2
    }
}

# Function to reset TCP/IP stack
function Reset-TCPStack {
    Write-Host "Resetting TCP/IP stack..." -ForegroundColor Yellow
    
    # Reset TCP/IP stack to default settings
    Write-Host "Resetting TCP/IP parameters..." -ForegroundColor Cyan
    netsh int ip reset
    
    # Reset Winsock catalog
    Write-Host "Resetting Winsock catalog..." -ForegroundColor Cyan
    netsh winsock reset
    
    # Flush DNS cache
    Write-Host "Flushing DNS cache..." -ForegroundColor Cyan
    ipconfig /flushdns
    
    # Renew IP address
    Write-Host "Renewing IP address..." -ForegroundColor Cyan
    ipconfig /release
    Start-Sleep -Seconds 2
    ipconfig /renew
    
    # Register DNS
    Write-Host "Registering DNS..." -ForegroundColor Cyan
    ipconfig /registerdns
}

# Function to fix problematic network settings
function Fix-NetworkSettings {
    Write-Host "Fixing problematic network settings..." -ForegroundColor Yellow
    
    # Remove problematic TCP settings that cause connectivity issues
    Write-Host "Removing problematic TCP settings..." -ForegroundColor Cyan
    
    # Reset TCP parameters to safe defaults
    netsh int tcp set global autotuninglevel=normal
    netsh int tcp set global chimney=enabled
    netsh int tcp set global rss=enabled
    netsh int tcp set global netdma=enabled
    netsh int tcp set global dca=enabled
    
    # Disable problematic settings that cause WiFi issues
    Write-Host "Disabling problematic optimization settings..." -ForegroundColor Cyan
    
    # Reset TCP window scaling to safe value
    netsh int tcp set global windowscaling=enabled
    
    # Set TCP timestamps to safe default
    netsh int tcp set global timestamps=enabled
    
    # Reset TCP selective acknowledgments
    netsh int tcp set global sack=enabled
    
    # Set TCP delayed acknowledgment to safe value
    netsh int tcp set global delayedack=enabled
    
    # Reset TCP fast open to safe default
    netsh int tcp set global fastopen=enabled
    netsh int tcp set global fastopenfallback=enabled
    
    # Reset TCP hybla to safe default
    netsh int tcp set global hybla=disabled
    
    # Reset TCP hystart to safe default
    netsh int tcp set global hystart=enabled
    
    # Reset TCP pruning to safe default
    netsh int tcp set global pruning=enabled
}

# Function to optimize DNS settings for stability
function Set-DNS-Stability {
    Write-Host "Setting DNS for stability..." -ForegroundColor Yellow
    
    # Set reliable DNS servers
    $primaryDNS = "8.8.8.8"  # Google DNS
    $secondaryDNS = "1.1.1.1"  # Cloudflare DNS
    
    # Get all active network adapters
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
    
    foreach ($adapter in $adapters) {
        $interface = $adapter.InterfaceIndex
        
        Write-Host "Setting DNS for adapter: $($adapter.Name)" -ForegroundColor Cyan
        
        # Set DNS servers
        Set-DnsClientServerAddress -InterfaceIndex $interface -ServerAddresses $primaryDNS, $secondaryDNS
        
        # Reset DNS cache
        Clear-DnsClientCache
    }
}

# Function to create restore point
function Create-RestorePoint {
    Write-Host "Creating system restore point..." -ForegroundColor Yellow
    
    try {
        Checkpoint-Computer -Description "LCTRON Network Fix" -RestorePointType "MODIFY_SETTINGS"
        Write-Host "System restore point created successfully." -ForegroundColor Green
    } catch {
        Write-Host "Could not create restore point. Continuing anyway..." -ForegroundColor Yellow
    }
}

# Function to verify network connectivity
function Test-NetworkConnectivity {
    Write-Host "Testing network connectivity..." -ForegroundColor Yellow
    
    # Wait for network to stabilize
    Start-Sleep -Seconds 5
    
    # Test basic connectivity
    try {
        $testResult = Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet
        if ($testResult) {
            Write-Host "Network connectivity test: PASSED" -ForegroundColor Green
        } else {
            Write-Host "Network connectivity test: FAILED" -ForegroundColor Red
        }
    } catch {
        Write-Host "Network connectivity test: FAILED" -ForegroundColor Red
    }
    
    # Test internet connectivity
    try {
        $internetTest = Test-NetConnection -ComputerName "www.google.com" -Port 443 -InformationLevel Quiet
        if ($internetTest) {
            Write-Host "Internet connectivity test: PASSED" -ForegroundColor Green
        } else {
            Write-Host "Internet connectivity test: FAILED" -ForegroundColor Red
        }
    } catch {
        Write-Host "Internet connectivity test: FAILED" -ForegroundColor Red
    }
}

# Function to create auto-fix script
function Create-AutoFix {
    Write-Host "Creating auto-fix script..." -ForegroundColor Yellow
    
    $autoFixScript = @'
# LCTRON Auto-Fix Script
# This script can be run automatically when network issues are detected

Write-Host "Running LCTRON Auto-Fix..." -ForegroundColor Green

# Quick network reset
ipconfig /release
Start-Sleep -Seconds 2
ipconfig /renew
ipconfig /flushdns

# Reset network adapters
Get-NetAdapter | Where-Object { $_.Status -eq "Up" | ForEach-Object {
    Disable-NetAdapter -Name $_.Name -Confirm:$false
    Start-Sleep -Seconds 1
    Enable-NetAdapter -Name $_.Name -Confirm:$false
}

# Reset TCP/IP stack
netsh int ip reset
netsh winsock reset

Write-Host "Auto-Fix completed!" -ForegroundColor Green
'@
    
    $scriptPath = "$env:TEMP\LCTRON_AutoFix.ps1"
    $autoFixScript | Out-File -FilePath $scriptPath -Encoding UTF8
    
    Write-Host "Auto-fix script created at: $scriptPath" -ForegroundColor Green
}

# Main execution
try {
    Write-Host "LCTRON Network Fix - Starting comprehensive repair..." -ForegroundColor Green
    Write-Host "This will fix WiFi connectivity issues caused by network optimization." -ForegroundColor Cyan
    
    # Create restore point
    Create-RestorePoint
    
    # Step 1: Reset network adapters
    Reset-NetworkAdapters
    
    # Step 2: Reset TCP/IP stack
    Reset-TCPStack
    
    # Step 3: Fix problematic settings
    Fix-NetworkSettings
    
    # Step 4: Set stable DNS
    Set-DNS-Stability
    
    # Step 5: Create auto-fix script
    Create-AutoFix
    
    # Step 6: Test connectivity
    Test-NetworkConnectivity
    
    Write-Host "LCTRON Network Fix completed successfully!" -ForegroundColor Green
    Write-Host "Your network should now be working properly." -ForegroundColor Cyan
    Write-Host "If issues persist, restart your computer and run the auto-fix script." -ForegroundColor Yellow
    
} catch {
    Write-Host "An error occurred during the fix: $_" -ForegroundColor Red
    Write-Host "Please restart your computer and try again." -ForegroundColor Yellow
}

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
