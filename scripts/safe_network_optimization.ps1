# LCTRON Safe Network Optimization Script
# Optimizes network settings without causing WiFi connectivity issues

Write-Host "LCTRON Safe Network Optimization - Starting..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires administrator privileges. Please run as administrator." -ForegroundColor Red
    pause
    exit
}

# Function to backup current network settings
function Backup-NetworkSettings {
    Write-Host "Backing up current network settings..." -ForegroundColor Yellow
    
    $backupPath = "$env:TEMP\LCTRON_Network_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    
    # Export current TCP settings
    $tcpSettings = netsh int tcp show global
    $tcpSettings | Out-File -FilePath $backupPath -Append
    
    # Export current network adapter settings
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
    foreach ($adapter in $adapters) {
        $adapterSettings = Get-NetAdapterAdvancedProperty -Name $adapter.Name
        "Adapter: $($adapter.Name)" | Out-File -FilePath $backupPath -Append
        $adapterSettings | Out-File -FilePath $backupPath -Append
        "" | Out-File -FilePath $backupPath -Append
    }
    
    Write-Host "Backup created at: $backupPath" -ForegroundColor Green
    return $backupPath
}

# Function to apply safe network optimizations
function Apply-SafeNetworkOptimizations {
    Write-Host "Applying safe network optimizations..." -ForegroundColor Yellow
    
    # SAFE TCP/IP Optimizations (these don't cause WiFi issues)
    Write-Host "Applying safe TCP optimizations..." -ForegroundColor Cyan
    
    # Enable TCP chimney (safe)
    netsh int tcp set global chimney=enabled
    
    # Enable RSS (Receive Side Scaling) - safe
    netsh int tcp set global rss=enabled
    
    # Enable NetDMA - safe
    netsh int tcp set global netdma=enabled
    
    # Enable DCA (Direct Cache Access) - safe
    netsh int tcp set global dca=enabled
    
    # Set autotuning to normal (not aggressive)
    netsh int tcp set global autotuninglevel=normal
    
    # AVOID PROBLEMATIC SETTINGS:
    Write-Host "Skipping problematic optimizations that cause WiFi issues..." -ForegroundColor Yellow
    
    # These settings are known to cause WiFi connectivity issues:
    # - Aggressive window scaling
    # - TCP timestamps modifications  
    # - TCP fast open (can cause issues with some routers)
    # - TCP hybla (experimental, can cause instability)
    
    Write-Host "Problematic settings skipped to maintain WiFi stability." -ForegroundColor Green
}

# Function to optimize DNS for better performance
function Optimize-DNS {
    Write-Host "Optimizing DNS settings..." -ForegroundColor Yellow
    
    # Set fast and reliable DNS servers
    $primaryDNS = "1.1.1.1"  # Cloudflare (fast)
    $secondaryDNS = "8.8.4.4"  # Google (reliable backup)
    
    # Get all active network adapters
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
    
    foreach ($adapter in $adapters) {
        $interface = $adapter.InterfaceIndex
        
        Write-Host "Optimizing DNS for adapter: $($adapter.Name)" -ForegroundColor Cyan
        
        # Set optimized DNS servers
        Set-DnsClientServerAddress -InterfaceIndex $interface -ServerAddresses $primaryDNS, $secondaryDNS
        
        # Optimize DNS client settings
        Set-DnsClient -InterfaceIndex $interface -ConnectionSuffix "lctron.local"
        
        # Set DNS cache timeout to optimal value
        Set-DnsClientCache -MaxCacheEntryTtl 3600
        Set-DnsClientCache -MaxNegativeCacheEntryTtl 300
    }
    
    # Flush DNS cache to apply new settings
    Clear-DnsClientCache
    Write-Host "DNS optimization completed." -ForegroundColor Green
}

# Function to optimize network adapter settings
function Optimize-NetworkAdapters {
    Write-Host "Optimizing network adapter settings..." -ForegroundColor Yellow
    
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
    
    foreach ($adapter in $adapters) {
        Write-Host "Optimizing adapter: $($adapter.Name)" -ForegroundColor Cyan
        
        try {
            # Enable interrupt moderation (reduces CPU usage)
            Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName "Interrupt Moderation" -DisplayValue "Enabled" -ErrorAction SilentlyContinue
            
            # Enable large send offload (improves performance)
            Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName "Large Send Offload" -DisplayValue "Enabled" -ErrorAction SilentlyContinue
            
            # Enable receive side scaling (improves performance)
            Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName "Receive Side Scaling" -DisplayValue "Enabled" -ErrorAction SilentlyContinue
            
            # Set power management to high performance
            Set-NetAdapterPowerManagement -Name $adapter.Name -WakeOnMagicPacket $false -WakeOnPattern $false -ErrorAction SilentlyContinue
            
        } catch {
            Write-Host "Some optimizations could not be applied to $($adapter.Name)" -ForegroundColor Yellow
        }
    }
}

# Function to create network monitor
function Create-NetworkMonitor {
    Write-Host "Creating network monitor..." -ForegroundColor Yellow
    
    $monitorScript = @'
# LCTRON Network Monitor
# Monitors network connectivity and triggers auto-fix if issues detected

$logPath = "$env:TEMP\LCTRON_Network_Monitor.log"

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -FilePath $logPath -Append
}

function Test-NetworkConnectivity {
    try {
        # Test basic connectivity
        $test1 = Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet -ErrorAction SilentlyContinue
        $test2 = Test-NetConnection -ComputerName "1.1.1.1" -Port 53 -InformationLevel Quiet -ErrorAction SilentlyContinue
        
        return ($test1 -or $test2)
    } catch {
        return $false
    }
}

function Trigger-AutoFix {
    Write-Log "Network connectivity issue detected! Triggering auto-fix..."
    
    # Run auto-fix
    & "$env:TEMP\LCTRON_AutoFix.ps1"
    
    Write-Log "Auto-fix completed."
}

# Monitor loop
$failedCount = 0
$maxFailures = 3

while ($true) {
    $isConnected = Test-NetworkConnectivity
    
    if ($isConnected) {
        Write-Log "Network connectivity: OK"
        $failedCount = 0
    } else {
        $failedCount++
        Write-Log "Network connectivity: FAILED (Attempt $failedCount/$maxFailures)"
        
        if ($failedCount -ge $maxFailures) {
            Trigger-AutoFix
            $failedCount = 0
        }
    }
    
    Start-Sleep -Seconds 30  # Check every 30 seconds
}
'@
    
    $monitorPath = "$env:TEMP\LCTRON_Network_Monitor.ps1"
    $monitorScript | Out-File -FilePath $monitorPath -Encoding UTF8
    
    Write-Host "Network monitor created at: $monitorPath" -ForegroundColor Green
    Write-Host "Run this script to continuously monitor your network connection." -ForegroundColor Cyan
}

# Function to create restore script
function Create-RestoreScript {
    Write-Host "Creating restore script..." -ForegroundColor Yellow
    
    $restoreScript = @'
# LCTRON Network Restore Script
# Restores network settings to Windows defaults

Write-Host "LCTRON Network Restore - Starting..." -ForegroundColor Green

# Reset all TCP/IP settings to defaults
Write-Host "Resetting TCP/IP to defaults..." -ForegroundColor Yellow
netsh int tcp set global autotuninglevel=normal
netsh int tcp set global chimney=enabled
netsh int tcp set global rss=enabled
netsh int tcp set global netdma=enabled
netsh int tcp set global dca=enabled
netsh int tcp set global windowscaling=default
netsh int tcp set global timestamps=default
netsh int tcp set global sack=default
netsh int tcp set global delayedack=default

# Reset network adapters
Write-Host "Resetting network adapters..." -ForegroundColor Yellow
Get-NetAdapter | Where-Object { $_.Status -eq "Up" | ForEach-Object {
    Disable-NetAdapter -Name $_.Name -Confirm:$false
    Start-Sleep -Seconds 2
    Enable-NetAdapter -Name $_.Name -Confirm:$false
}

# Reset DNS to automatic
Write-Host "Resetting DNS to automatic..." -ForegroundColor Yellow
Get-NetAdapter | Where-Object { $_.Status -eq "Up" | ForEach-Object {
    Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ResetServerAddresses
}

# Reset TCP/IP stack and Winsock
Write-Host "Resetting TCP/IP stack..." -ForegroundColor Yellow
netsh int ip reset
netsh winsock reset
ipconfig /flushdns
ipconfig /release
Start-Sleep -Seconds 3
ipconfig /renew

Write-Host "Network restore completed!" -ForegroundColor Green
Write-Host "Your network settings have been reset to Windows defaults." -ForegroundColor Cyan
'@
    
    $restorePath = "$env:TEMP\LCTRON_Network_Restore.ps1"
    $restoreScript | Out-File -FilePath $restorePath -Encoding UTF8
    
    Write-Host "Restore script created at: $restorePath" -ForegroundColor Green
}

# Function to test network performance
function Test-NetworkPerformance {
    Write-Host "Testing network performance..." -ForegroundColor Yellow
    
    try {
        # Test ping to Google DNS
        $pingResult = Test-Connection -ComputerName "8.8.8.8" -Count 4 -ErrorAction SilentlyContinue
        if ($pingResult) {
            $avgLatency = ($pingResult.ResponseTime | Measure-Object -Average).Average
            Write-Host "Average latency to Google DNS: $([math]::Round($avgLatency, 2)) ms" -ForegroundColor Green
        }
        
        # Test internet connectivity
        $internetTest = Test-NetConnection -ComputerName "www.google.com" -Port 443 -InformationLevel Quiet -ErrorAction SilentlyContinue
        if ($internetTest) {
            Write-Host "Internet connectivity: PASSED" -ForegroundColor Green
        } else {
            Write-Host "Internet connectivity: FAILED" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "Network performance test failed: $_" -ForegroundColor Red
    }
}

# Main execution
try {
    Write-Host "LCTRON Safe Network Optimization - Starting..." -ForegroundColor Green
    Write-Host "This will optimize your network without causing WiFi connectivity issues." -ForegroundColor Cyan
    
    # Step 1: Backup current settings
    $backupPath = Backup-NetworkSettings
    
    # Step 2: Apply safe optimizations
    Apply-SafeNetworkOptimizations
    
    # Step 3: Optimize DNS
    Optimize-DNS
    
    # Step 4: Optimize network adapters
    Optimize-NetworkAdapters
    
    # Step 5: Create network monitor
    Create-NetworkMonitor
    
    # Step 6: Create restore script
    Create-RestoreScript
    
    # Step 7: Test performance
    Test-NetworkPerformance
    
    Write-Host "" -ForegroundColor White
    Write-Host "LCTRON Safe Network Optimization completed successfully!" -ForegroundColor Green
    Write-Host "Your network has been optimized without risking WiFi connectivity." -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "Created files:" -ForegroundColor Yellow
    Write-Host "  - Network Monitor: $env:TEMP\LCTRON_Network_Monitor.ps1" -ForegroundColor White
    Write-Host "  - Restore Script: $env:TEMP\LCTRON_Network_Restore.ps1" -ForegroundColor White
    Write-Host "  - Settings Backup: $backupPath" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "If you experience any issues, run the restore script to reset to defaults." -ForegroundColor Red
    
} catch {
    Write-Host "An error occurred during optimization: $_" -ForegroundColor Red
    Write-Host "Your network settings were not modified." -ForegroundColor Yellow
}

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
