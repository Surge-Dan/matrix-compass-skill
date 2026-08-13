param(
  [Parameter(Mandatory = $true)]
  [string]$TargetPath,
  [Parameter(Mandatory = $true)]
  [string]$DataPath,
  [switch]$AutoStart
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common.ps1")
$repository = "https://github.com/Surge-Dan/matrix-compass.git"
$resolvedTarget = [System.IO.Path]::GetFullPath($TargetPath)
$resolvedData = Set-MatrixCompassDataPath -DataPath $DataPath -ProjectPath $resolvedTarget
$runtime = Initialize-MatrixCompassRuntime
Write-MatrixCompassRuntimeSummary -Runtime $runtime

if (-not [System.IO.Path]::IsPathRooted($TargetPath)) {
  throw "The installation directory must be an absolute path."
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git was not found."
}
if (Test-Path -LiteralPath $resolvedTarget) {
  if ((Get-ChildItem -LiteralPath $resolvedTarget -Force | Measure-Object).Count -gt 0) {
    throw "The installation directory is not empty: $resolvedTarget"
  }
} else {
  $parent = Split-Path -Parent $resolvedTarget
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
}

& git clone $repository $resolvedTarget
if ($LASTEXITCODE -ne 0) { throw "Git clone failed." }
Push-Location $resolvedTarget
try {
  Invoke-MatrixCompassNpm -Runtime $runtime -Arguments @("ci")
  if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed." }
  Invoke-MatrixCompassNpm -Runtime $runtime -Arguments @("run", "db:migrate")
  if ($LASTEXITCODE -ne 0) { throw "Initial local database migration failed." }
} finally {
  Pop-Location
}
if ($AutoStart) {
  $setupArguments = @("-ProjectPath", $resolvedTarget, "-DataPath", $resolvedData, "-AutoStart")
} else {
  $setupArguments = @("-ProjectPath", $resolvedTarget, "-DataPath", $resolvedData)
}
& (Join-Path $resolvedTarget "skill\matrix-compass\scripts\setup.ps1") @setupArguments
if ($LASTEXITCODE -ne 0) { throw "Matrix Compass setup failed." }
Write-Output "Matrix Compass installed: $resolvedTarget"
Write-Output "Matrix Compass data directory: $resolvedData"
