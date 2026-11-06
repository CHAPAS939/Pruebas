[CmdletBinding(SupportsShouldProcess)]
param([switch]$SkipFork)
$ErrorActionPreference = 'Stop'
$ExpectedLogin = 'CHAPAS939'
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Instala GitHub CLI desde https://cli.github.com/ y vuelve a ejecutar este archivo.' }
function Read-GitHub([string]$Route) {
    $PreviousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $Raw = & gh api $Route 2>$null
        $Code = $LASTEXITCODE
    } finally { $ErrorActionPreference = $PreviousPreference }
    if ($Code -ne 0) { return $null }
    return ($Raw | ConvertFrom-Json)
}
function Write-GitHub([string]$Route, [string]$Method, [object]$Body) {
    $Temporary = [IO.Path]::GetTempFileName()
    try {
        [IO.File]::WriteAllText($Temporary, ($Body | ConvertTo-Json -Depth 30 -Compress), [Text.UTF8Encoding]::new($false))
        $Raw = & gh api --method $Method $Route --input $Temporary
        if ($LASTEXITCODE -ne 0) { throw "GitHub ha rechazado $Method $Route" }
        return ($Raw | ConvertFrom-Json)
    } finally { Remove-Item -LiteralPath $Temporary -Force }
}
$ErrorActionPreference = 'Continue'
& gh auth status 2>$null
$AuthCode = $LASTEXITCODE
$ErrorActionPreference = 'Stop'
if ($AuthCode -ne 0) {
    & gh auth login --hostname github.com --git-protocol https --web
    if ($LASTEXITCODE -ne 0) { throw 'No se ha completado el inicio de sesión. No se ha cambiado el perfil.' }
}
$User = Read-GitHub 'user'
if (-not $User -or $User.login -ne $ExpectedLogin) { throw "La cuenta activa debe ser $ExpectedLogin. No se ha cambiado otra cuenta." }
if (-not $SkipFork) {
    $Fork = Read-GitHub "repos/$ExpectedLogin/coucou"
    if ($Fork -and (-not $Fork.fork -or $Fork.parent.full_name -ine 'louis-cfm/coucou')) { throw 'Ya existe coucou y no es el fork esperado. No se sustituirá.' }
    if (-not $Fork -and $PSCmdlet.ShouldProcess("$ExpectedLogin/coucou", 'Crear el fork de louis-cfm/coucou')) {
        $Fork = Write-GitHub 'repos/louis-cfm/coucou/forks' 'POST' @{name='coucou';default_branch_only=$true}
        Write-Host "Fork creado: $($Fork.html_url)"
    }
}
$Name = "$ExpectedLogin/$ExpectedLogin"
$Repository = Read-GitHub "repos/$Name"
if ($Repository -and $Repository.private) { throw 'El repositorio especial existente es privado. No se cambiará su visibilidad ni se publicará su contenido.' }
if (-not $Repository) {
    if (-not $PSCmdlet.ShouldProcess($Name, 'Crear el repositorio público especial del perfil')) { return }
    $Repository = Write-GitHub 'user/repos' 'POST' @{name=$ExpectedLogin;description='Interfaces, motion and playful software';private=$false;auto_init=$true}
}
if (-not $PSCmdlet.ShouldProcess($Name, 'Aplicar README y recursos del perfil; conservar el README anterior')) { return }
$Branch = $Repository.default_branch
$Reference = $null
for ($Attempt=0;$Attempt -lt 10 -and -not $Reference;$Attempt++) {
    $Reference = Read-GitHub "repos/$Name/git/ref/heads/$Branch"
    if (-not $Reference) { Start-Sleep -Milliseconds 500 }
}
if (-not $Reference) { throw 'GitHub todavía no ha preparado la rama del perfil. Puedes volver a ejecutar el archivo.' }
$Parent = Read-GitHub "repos/$Name/git/commits/$($Reference.object.sha)"
$Entries = @()
$Previous = Read-GitHub "repos/$Name/contents/README.md"
if ($Previous -and $Previous.sha) {
    $Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $Entries += @{path=".profile-backups/README-$Stamp.md";mode='100644';type='blob';sha=$Previous.sha}
}
$Files = @((Get-Item (Join-Path $PSScriptRoot 'README.md')))
$Files += @(Get-ChildItem (Join-Path $PSScriptRoot 'assets') -File)
foreach ($File in $Files) {
    $Relative = if ($File.Name -eq 'README.md') { 'README.md' } else { "assets/$($File.Name)" }
    $Blob = Write-GitHub "repos/$Name/git/blobs" 'POST' @{encoding='base64';content=[Convert]::ToBase64String([IO.File]::ReadAllBytes($File.FullName))}
    $Entries += @{path=$Relative;mode='100644';type='blob';sha=$Blob.sha}
}
$Tree = Write-GitHub "repos/$Name/git/trees" 'POST' @{base_tree=$Parent.tree.sha;tree=$Entries}
$Commit = Write-GitHub "repos/$Name/git/commits" 'POST' @{message='Apply custom CHAPAS939 visual profile';tree=$Tree.sha;parents=@($Reference.object.sha)}
$null = Write-GitHub "repos/$Name/git/refs/heads/$Branch" 'PATCH' @{sha=$Commit.sha;force=$false}
Write-Host "Perfil actualizado: https://github.com/$ExpectedLogin"
Write-Host 'El avatar propuesto no se cambia automáticamente. Las claves de acceso permanecen en GitHub CLI.'
