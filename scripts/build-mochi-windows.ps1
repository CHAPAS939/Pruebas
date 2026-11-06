param([switch]$SkipInstall)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ($env:OS -ne 'Windows_NT') { throw 'This build requires Windows and the Tauri build tools.' }
$Root = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $Root 'build/mochi-installers/windows'
$Version = (Get-Content (Join-Path $Root 'mochi-preview.json') -Raw | ConvertFrom-Json).version
function Invoke-Native {
    param([string]$File, [string[]]$Arguments)
    & $File @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$File failed with exit code $LASTEXITCODE" }
}
Push-Location $Root
try {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
    Invoke-Native -File node -Arguments @('--test', 'tests/mochi-scene.test.mjs', 'tests/mochi-studio.test.mjs')
    Push-Location (Join-Path $Root 'windows')
    try {
        if (-not $SkipInstall) { Invoke-Native -File npm.cmd -Arguments @('ci') }
        Invoke-Native -File node -Arguments @('../scripts/build-studio-icons.mjs', '--check')
        Invoke-Native -File npx.cmd -Arguments @('tsc', '--noEmit')
        Invoke-Native -File npm.cmd -Arguments @('test')
        Invoke-Native -File cargo -Arguments @('build', '--release', '--locked', '-p', 'coucou-hook')
        Invoke-Native -File cargo -Arguments @('test', '--release', '--workspace', '--locked')
        $TauriArgs = @('tauri', 'build', '--bundles', 'nsis,msi')
        if ($env:COUCOU_WINDOWS_CERT_THUMBPRINT) {
            $Thumbprint = $env:COUCOU_WINDOWS_CERT_THUMBPRINT.Replace(' ', '')
            if ($Thumbprint -notmatch '^[A-Fa-f0-9]{40}$' -or -not (Test-Path "Cert:\CurrentUser\My\$Thumbprint")) { throw 'The requested signing certificate is not installed in CurrentUser/My.' }
            $SignConfig = Join-Path $OutDir 'tauri-signing.json'
            @{bundle = @{windows = @{certificateThumbprint = $Thumbprint; digestAlgorithm = 'sha256'; timestampUrl = 'https://timestamp.digicert.com'; tsp = $true}}} | ConvertTo-Json -Depth 5 | Set-Content $SignConfig
            $TauriArgs += @('--config', $SignConfig)
        }
        # Cached bundles from a different preview version must not enter this release.
        foreach ($Kind in @('nsis', 'msi')) { $Bundle = "target/release/bundle/$Kind"; if (Test-Path $Bundle) { Remove-Item $Bundle -Recurse -Force } }
        Invoke-Native -File npx.cmd -Arguments $TauriArgs
        Invoke-Native -File node -Arguments @('../scripts/test-mochi-resources.mjs', 'dist/mochi-scenes')
        foreach ($Kind in @('nsis', 'msi')) {
            $Suffix = if ($Kind -eq 'nsis') { '*-setup.exe' } else { '*.msi' }
            $Files = @(Get-ChildItem -Path "target/release/bundle/$Kind/$Suffix" -File)
            if ($Files.Count -ne 1) { throw "Expected exactly one $Kind installer, got $($Files.Count)" }
            $Name = if ($Kind -eq 'nsis') { "Coucou-Mochi-$Version-Windows-x64-setup.exe" } else { "Coucou-Mochi-$Version-Windows-x64.msi" }
            Copy-Item -LiteralPath $Files[0].FullName -Destination (Join-Path $OutDir $Name) -Force
        }
        # A portable pair is useful for checking the app without installing it.
        $Portable = Join-Path $OutDir 'portable'
        New-Item -ItemType Directory -Path $Portable -Force | Out-Null
        Copy-Item target/release/coucou.exe,target/release/coucou-hook.exe -Destination $Portable -Force
        Get-ChildItem target/release/*.dll -ErrorAction SilentlyContinue | Copy-Item -Destination $Portable -Force
        Compress-Archive -Path "$Portable/*" -DestinationPath (Join-Path $OutDir "Coucou-Mochi-$Version-Windows-x64-portable.zip") -Force
    } finally { Pop-Location }
    $SignatureStatus = 'unsigned'
    if ($env:COUCOU_WINDOWS_CERT_THUMBPRINT) {
        $ToVerify = @(Get-ChildItem $OutDir -File | Where-Object { $_.Extension -in '.exe', '.msi' })
        $ToVerify += Get-Item (Join-Path $Root 'windows/target/release/coucou.exe')
        foreach ($File in $ToVerify) {
            $Signature = Get-AuthenticodeSignature $File.FullName
            if ($Signature.Status -ne 'Valid') { throw "Signature validation failed for $($File.Name): $($Signature.Status)" }
        }
        $SignatureStatus = 'Authenticode; signature verified'
    }
    @{status = $SignatureStatus} | ConvertTo-Json | Set-Content (Join-Path $OutDir 'signature-status.json')
    Invoke-Native -File node -Arguments @('scripts/write-mochi-build-manifest.mjs', $OutDir, 'Windows', 'x64')
    Get-ChildItem $OutDir -File | Format-Table Name, Length
} finally { Pop-Location }
