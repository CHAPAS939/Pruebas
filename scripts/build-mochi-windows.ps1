param([switch]$SkipInstall)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ($env:OS -ne 'Windows_NT') { throw 'This build requires Windows and the Tauri build tools.' }
$Root = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $Root 'build/mochi-installers/windows'
function Invoke-Native {
    param([string]$File, [string[]]$Arguments)
    & $File @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$File failed with exit code $LASTEXITCODE" }
}
Push-Location $Root
try {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
    Invoke-Native -File node -Arguments @('--test', 'tests/mochi-scene.test.mjs')
    Push-Location (Join-Path $Root 'windows')
    try {
        if (-not $SkipInstall) { Invoke-Native -File npm.cmd -Arguments @('ci') }
        Invoke-Native -File npx.cmd -Arguments @('tsc', '--noEmit')
        Invoke-Native -File npm.cmd -Arguments @('test')
        Invoke-Native -File cargo -Arguments @('build', '--release', '--locked', '-p', 'coucou-hook')
        Invoke-Native -File cargo -Arguments @('test', '--release', '--workspace', '--locked')
        Invoke-Native -File npx.cmd -Arguments @('tauri', 'build', '--bundles', 'nsis,msi')
        Invoke-Native -File node -Arguments @('../scripts/test-mochi-resources.mjs', 'dist/mochi-scenes')
        foreach ($Kind in @('nsis', 'msi')) {
            $Suffix = if ($Kind -eq 'nsis') { '*-setup.exe' } else { '*.msi' }
            $Files = @(Get-ChildItem -Path "target/release/bundle/$Kind/$Suffix" -File)
            if ($Files.Count -ne 1) { throw "Expected exactly one $Kind installer, got $($Files.Count)" }
            $Name = if ($Kind -eq 'nsis') { 'Coucou-Mochi-Windows-x64-setup.exe' } else { 'Coucou-Mochi-Windows-x64.msi' }
            Copy-Item -LiteralPath $Files[0].FullName -Destination (Join-Path $OutDir $Name) -Force
        }
        # A portable pair is useful for checking the app without installing it.
        $Portable = Join-Path $OutDir 'portable'
        New-Item -ItemType Directory -Path $Portable -Force | Out-Null
        Copy-Item target/release/coucou.exe,target/release/coucou-hook.exe -Destination $Portable -Force
        Get-ChildItem target/release/*.dll -ErrorAction SilentlyContinue | Copy-Item -Destination $Portable -Force
        Compress-Archive -Path "$Portable/*" -DestinationPath (Join-Path $OutDir 'Coucou-Mochi-Windows-x64-portable.zip') -Force
    } finally { Pop-Location }
    Invoke-Native -File node -Arguments @('scripts/write-mochi-build-manifest.mjs', $OutDir, 'Windows', 'x64')
    Get-ChildItem $OutDir -File | Format-Table Name, Length
} finally { Pop-Location }
