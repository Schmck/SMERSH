$location = Get-Location
$folders = Get-ChildItem -Path $location -Directory 

foreach($folder in $folders) {
    Set-Location $folder
    Remove-Item -Force -Recurse .\bin\
    Remove-Item -Force -Recurse .\obj\
    Get-ChildItem *.js,*.js.map -Exclude .\node_modules\ | ForEach-Object { Remove-Item -Path $_.FullName }


    Set-Location ..
}