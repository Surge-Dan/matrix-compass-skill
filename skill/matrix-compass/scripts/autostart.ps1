param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectPath,
  [Parameter(Mandatory = $true)]
  [string]$DataPath,
  [ValidateSet("install", "uninstall", "status", "run")]
  [string]$Action = "install",
  [switch]$Lan
)

$ErrorActionPreference = "Stop"
$resolvedProject = [System.IO.Path]::GetFullPath($ProjectPath)
$resolvedData = [System.IO.Path]::GetFullPath($DataPath)
$startupDirectory = if ($env:MATRIX_COMPASS_STARTUP_DIR) {
  [System.IO.Path]::GetFullPath($env:MATRIX_COMPASS_STARTUP_DIR)
} else {
  Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"
}
$launcherPath = Join-Path $startupDirectory "Matrix Compass.vbs"
$startScript = Join-Path $PSScriptRoot "start.ps1"
$powershellPath = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

if ($Action -eq "status") {
  if (Test-Path -LiteralPath $launcherPath -PathType Leaf) {
    Write-Output "Matrix Compass auto-start: enabled ($launcherPath)"
    exit 0
  }
  Write-Output "Matrix Compass auto-start: disabled"
  exit 0
}

if ($Action -eq "uninstall") {
  if (Test-Path -LiteralPath $launcherPath -PathType Leaf) {
    Remove-Item -LiteralPath $launcherPath -Force
    Write-Output "Matrix Compass auto-start removed: $launcherPath"
  } else {
    Write-Output "Matrix Compass auto-start was already disabled."
  }
  exit 0
}

if ($Action -eq "run") {
  try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health" -TimeoutSec 2
    if ($health.status -eq "ok" -and $health.dataSource -eq "local-d1") { exit 0 }
  } catch { }

  $logDirectory = Join-Path $resolvedData "logs"
  New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
  $logPath = Join-Path $logDirectory "autostart.log"
  $arguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $startScript,
    "-ProjectPath", $resolvedProject,
    "-DataPath", $resolvedData
  )
  if ($Lan) { $arguments += "-Lan" }
  & $powershellPath @arguments *>> $logPath
  exit $LASTEXITCODE
}

if (-not (Test-Path -LiteralPath $resolvedProject -PathType Container)) {
  throw "Project directory was not found: $resolvedProject"
}
New-Item -ItemType Directory -Force -Path $startupDirectory | Out-Null
$runCommand = "`"$powershellPath`" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PSCommandPath`" -ProjectPath `"$resolvedProject`" -DataPath `"$resolvedData`" -Action run"
if ($Lan) { $runCommand += " -Lan" }
$escapedCommand = $runCommand.Replace('"', '""')
$launcher = "Set shell = CreateObject(""WScript.Shell"")`r`nshell.Run ""$escapedCommand"", 0, False`r`n"
Set-Content -LiteralPath $launcherPath -Value $launcher -Encoding Unicode
Write-Output "Matrix Compass auto-start enabled: $launcherPath"
