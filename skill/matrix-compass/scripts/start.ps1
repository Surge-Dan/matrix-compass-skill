param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectPath,
  [Parameter(Mandatory = $true)]
  [string]$DataPath,
  [switch]$Lan
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common.ps1")
$resolvedProject = (Resolve-Path -LiteralPath $ProjectPath).Path
$runtime = Initialize-MatrixCompassRuntime
Write-MatrixCompassRuntimeSummary -Runtime $runtime
if (-not (Test-Path -LiteralPath (Join-Path $resolvedProject "package.json"))) {
  throw "The target is not a Matrix Compass project: $resolvedProject"
}
Set-MatrixCompassDataPath -DataPath $DataPath -ProjectPath $resolvedProject | Out-Null
Push-Location $resolvedProject
try {
  $dependencyMarkers = @(
    (Join-Path $resolvedProject "node_modules\.bin\tsx.cmd"),
    (Join-Path $resolvedProject "node_modules\vite\package.json"),
    (Join-Path $resolvedProject "node_modules\wrangler\package.json")
  )
  $missingDependencies = @($dependencyMarkers | Where-Object { -not (Test-Path -LiteralPath $_ -PathType Leaf) })
  if ($missingDependencies.Count -gt 0) {
    Write-Output "检测到依赖未安装或不完整，正在使用已选择的 Node.js 安装锁定依赖..."
    Invoke-MatrixCompassNpm -Runtime $runtime -Arguments @("ci")
    if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed. Run the Skill with the bundled Node.js runtime and try again." }
  }
  if ($Lan) {
    Invoke-MatrixCompassNpm -Runtime $runtime -Arguments @("run", "dev:lan")
  } else {
    Invoke-MatrixCompassNpm -Runtime $runtime -Arguments @("run", "dev")
  }
  if ($LASTEXITCODE -ne 0) { throw "Matrix Compass failed to start." }
} finally {
  Pop-Location
}
