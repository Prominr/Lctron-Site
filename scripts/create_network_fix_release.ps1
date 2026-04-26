# LCTRON Optimizer v1.1.0 - Network Fix Release Script
# This script creates a GitHub release for the network fix update

# Configuration
$GITHUB_OWNER = "Prominr"
$GITHUB_REPO = "Lctron-Optimizer"
$VERSION = "1.1.0"
$TAG_NAME = "v$VERSION"
$RELEASE_NAME = "LCTRON Optimizer v1.1.0 - Network Fix Update"

# Release Notes
$RELEASE_BODY = @"
## Network Fix Update - v1.1.0

### Critical Fixes
- **WiFi Connectivity Fix**: Resolved the "connected but no internet" issue caused by aggressive network optimization
- **TCP/IP Stack Reset**: Added automatic TCP/IP stack repair functionality
- **Safe Network Optimization**: Updated network scripts to avoid connectivity issues

### New Features
- **Network Repair Tool**: One-click network fix for connectivity problems
- **Auto-Fix Mechanism**: Automatic detection and repair of network issues
- **Network Monitor**: Background monitoring with automatic issue resolution
- **Safe Optimization Mode**: Network optimizations that don't break WiFi connectivity

### Improvements
- Enhanced error handling for network operations
- Better restore point creation before network changes
- Improved DNS optimization with stability focus
- Updated PowerShell scripts with better error recovery

### Files Added
- `scripts/network_fix.ps1` - Emergency network repair script
- `scripts/safe_network_optimization.ps1` - Safe network optimization
- `components/NetworkTools.js` - Web interface for network tools

### Bug Fixes
- Fixed TCP/IP stack corruption during optimization
- Resolved WiFi adapter disable issues
- Fixed DNS cache problems after optimization
- Better handling of network adapter resets

### Premium Member Updates
- Added `misteryous321@gmail.com` as premium member
- Enhanced premium authentication system
- Updated account management with better security

---

**Important**: If you experienced WiFi connectivity issues after optimization, this update resolves those problems completely.

**Upgrade Instructions**:
1. Download the latest version from the releases page
2. Run the installer as administrator
3. Use the Network Fix tool if you have existing connectivity issues

**System Requirements**:
- Windows 10 / 11 (64-bit)
- Administrator privileges for network operations
- Internet connection for initial setup

---

## Installation
1. Download `LCTRON-Optimizer-v1.1.0.exe` below
2. Run as Administrator
3. Follow the installation wizard
4. Launch and enjoy optimized performance!

## Network Issues?
If you're experiencing WiFi connectivity problems:
1. Open LCTRON Optimizer
2. Navigate to Network Tools
3. Click "Fix Network Issues"
4. Restart your computer if needed

## Support
- **Discord**: [Join our community](https://discord.gg/7J62ArFa75)
- **GitHub**: [Report issues](https://github.com/Prominr/Lctron-Optimizer/issues)
- **Premium Support**: Available for premium members

---

**Note**: This is a free update for all existing users.
"@

# Create release using GitHub CLI (if available)
function Create-GitHubRelease {
    param(
        [string]$Tag,
        [string]$Name,
        [string]$Body,
        [bool]$Prerelease = $false
    )
    
    try {
        # Check if gh CLI is available
        $ghAvailable = Get-Command gh -ErrorAction SilentlyContinue
        
        if ($ghAvailable) {
            Write-Host "Creating GitHub release using gh CLI..." -ForegroundColor Green
            
            # Create release
            $releaseCommand = "gh release create $Tag --title `"$Name`" --notes `"$Body`""
            if ($Prerelease) {
                $releaseCommand += " --prerelease"
            }
            
            Invoke-Expression $releaseCommand
            Write-Host "GitHub release created successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "GitHub CLI not found. Please create release manually or install gh CLI." -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "Error creating GitHub release: $_" -ForegroundColor Red
        return $false
    }
}

# Generate changelog
function Generate-Changelog {
    param(
        [string]$Version,
        [string]$OutputPath
    )
    
    $changelog = @"
# Changelog

## [$Version] - $(Get-Date -Format 'yyyy-MM-dd')

### Fixed
- WiFi connectivity issues after network optimization
- TCP/IP stack corruption during aggressive tweaks
- DNS cache problems after optimization runs
- Network adapter disable/enable issues

### Added
- Network Repair Tool with one-click fix
- Safe Network Optimization mode
- Automatic network issue detection and repair
- Network monitoring with auto-fix capabilities
- Premium member support for misteryous321@gmail.com

### Changed
- Updated network optimization scripts to be safer
- Improved error handling for network operations
- Enhanced restore point creation
- Better DNS optimization with stability focus

### Security
- Enhanced premium authentication system
- Improved account security measures
- Better session management

---

## Previous Versions
### [1.0.0] - 2024-01-01
- Initial release
- Basic optimization features
- Premium membership system
"@
    
    $changelog | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Host "Changelog generated at: $OutputPath" -ForegroundColor Green
}

# Main execution
Write-Host "LCTRON Optimizer v1.1.0 - Network Fix Release" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Generate changelog
$changelogPath = ".\CHANGELOG.md"
Generate-Changelog -Version $VERSION -OutputPath $changelogPath

# Create GitHub release
Write-Host "`nCreating GitHub release..." -ForegroundColor Yellow
$releaseCreated = Create-GitHubRelease -Tag $TAG_NAME -Name $RELEASE_NAME -Body $RELEASE_BODY

if ($releaseCreated) {
    Write-Host "`nRelease created successfully!" -ForegroundColor Green
    Write-Host "Release URL: https://github.com/$GITHUB_OWNER/$GITHUB_REPO/releases/tag/$TAG_NAME" -ForegroundColor Cyan
} else {
    Write-Host "`nManual release creation required." -ForegroundColor Yellow
    Write-Host "Please visit: https://github.com/$GITHUB_OWNER/$GITHUB_REPO/releases/new" -ForegroundColor Cyan
    Write-Host "Use the following information:" -ForegroundColor White
    Write-Host "Tag: $TAG_NAME" -ForegroundColor White
    Write-Host "Title: $RELEASE_NAME" -ForegroundColor White
    Write-Host "Description: (See RELEASE_BODY variable)" -ForegroundColor White
}

Write-Host "`nRelease preparation complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload the installer binary to the release" -ForegroundColor White
Write-Host "2. Test the release download" -ForegroundColor White
Write-Host "3. Update website with new version information" -ForegroundColor White
Write-Host "4. Notify users about the network fix update" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
