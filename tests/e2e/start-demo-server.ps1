$env:MATRIX_COMPASS_MODE = "demo"
$node = "C:\Users\Daniel\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
& $node "$PSScriptRoot\..\..\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 3101
