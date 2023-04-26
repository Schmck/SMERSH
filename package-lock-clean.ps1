$location = Get-Location
$directory = "$(Split-Path "$($location)" -Leaf)"
$folders = Get-ChildItem -Path $location -Directory 

Write-Host($directory)


foreach($folder in $folders) {
    $name = "$(Split-Path "$($folder)" -Leaf)"
    $nodeProject = 0;
    Set-Location $folder
    Write-Host("cleaning package lock for $name")

    Try {
       $nodeProject = Get-ChildItem -Path ".\node_modules" -Directory -ErrorAction Stop
    } Catch {
        Write-Host("$name does not contain a .\node_modules folder")
    }
    if($nodeProject) {
        Remove-Item -Force .\package-lock.json
        Write-Host("package lock cleaned for $name")
        
    }
    Set-Location ..
    
}
Remove-Item -Force .\package-lock.json