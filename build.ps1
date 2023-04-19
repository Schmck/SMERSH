$location = Get-Location
$directory = "$(Split-Path "$($location)" -Leaf)"
$folders = Get-ChildItem -Path $location -Directory 

Write-Host($directory)

foreach($folder in $folders) {
    $name = "$(Split-Path "$($folder)" -Leaf)"
    $nodeProject = $null;
    Set-Location $folder

    Try {
      $nodeProject = Get-ChildItem -Path ".\node_modules" -Directory -ErrorAction Stop
      Write-Host("------ Rebuild started: Project: $name ------")
    } Catch {
        Write-Host("$name does not contain a .\node_modules folder")
    }

    if($nodeProject) {
      Write-Host("  >tsc --build --clean")
      tsc --build --clean
      Write-Host("  >tsc --build")
      tsc --build
      
        
    }
    Set-Location ..
    
}