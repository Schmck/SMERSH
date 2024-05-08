#!/bin/bash

# Get the current directory
location=$(pwd)
directory=$(basename "$location")
echo "$directory"

# Iterate through subdirectories
for folder in */; do
    # Change directory to the subdirectory
    cd "$folder" || exit
    # Run npm install
    npm install
    # Move back to the parent directory
    cd ..
done

# Run npm install in the original directory
npm install