#!/bin/bash

# Get the current directory
location=$(pwd)
directory=$(basename "$location")
echo "------ Solution: $directory ------"

# Iterate through subdirectories
for folder in */; do
    # Extract the name of the subdirectory
    name=$(basename "$folder")
    nodeProject=""

    # Change directory to the subdirectory
    cd "$folder" || exit

    # Check if node_modules directory exists
    if [ -d "./node_modules" ]; then
        echo "------ Rebuild started: Project: $name ------"
        # Clean and rebuild TypeScript files
        echo "  > tsc --build --clean"
        tsc --build --clean
        echo "  > tsc --build"
        tsc --build
    else
        echo "------ Skipping folder: Folder: $name ------"
    fi

    # Move back to the parent directory
    cd ..
done