param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectPath,
  [Parameter(Mandatory = $true)]
  [string]$DataPath,
  [switch]$AutoStart,
  [switch]$Lan,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common.ps1")
$powershellPath = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$resolvedProject = (Resolve-Path -LiteralPath $ProjectPath).Path
$runtime = Initialize-MatrixCompassRuntime
Write-MatrixCompassRuntimeSummary -Runtime $runtime
if (-not (Test-Path -LiteralPath (Join-Path $resolvedProject "package.json") -PathType Leaf)) {
  throw "The target is not a Matrix Compass project: $resolvedProject"
}
$resolvedData = Set-MatrixCompassDataPath -DataPath $DataPath -ProjectPath $resolvedProject
$startScript = Join-Path $resolvedProject "skill\matrix-compass\scripts\start.ps1"
$autoStartScript = Join-Path $resolvedProject "skill\matrix-compass\scripts\autostart.ps1"
if (-not (Test-Path -LiteralPath $startScript -PathType Leaf)) {
  throw "The project is missing its start script: $startScript"
}

if ($AutoStart) {
  & $powershellPath -NoProfile -ExecutionPolicy Bypass -File $autoStartScript -ProjectPath $resolvedProject -DataPath $resolvedData -Action install
  if ($LASTEXITCODE -ne 0) { throw "Auto-start setup failed." }
}

$appUri = "http://127.0.0.1:3000"
$healthUri = "$appUri/api/health"
$healthy = $false
try {
  $health = Invoke-RestMethod -Uri $healthUri -TimeoutSec 2
  $healthy = $health.status -eq "ok" -and $health.dataSource -eq "local-d1"
} catch { }

if (-not $healthy) {
  $logDirectory = Join-Path $resolvedData "logs"
  New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
  $stdoutLog = Join-Path $logDirectory "matrix-compass.log"
  $stderrLog = Join-Path $logDirectory "matrix-compass.error.log"
  $arguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $startScript,
    "-ProjectPath", $resolvedProject,
    "-DataPath", $resolvedData
  )
  if ($Lan) { $arguments += "-Lan" }
  Start-Process -FilePath $powershellPath -WindowStyle Hidden -ArgumentList $arguments -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog | Out-Null

  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    Start-Sleep -Milliseconds 500
    try {
      $health = Invoke-RestMethod -Uri $healthUri -TimeoutSec 2
      if ($health.status -eq "ok" -and $health.dataSource -eq "local-d1") {
        $healthy = $true
        break
      }
    } catch { }
  }
  if (-not $healthy) {
    throw "Matrix Compass did not become healthy. Check $stderrLog"
  }
}

if (-not $NoBrowser) {
  Start-Process $appUri | Out-Null
}

Write-Output "Matrix Compass is ready: $appUri"
Write-Output "Data directory: $resolvedData"
if ($AutoStart) {
  Write-Output "Auto-start: enabled for the current Windows user"
} else {
  Write-Output "Auto-start: not changed"
}
