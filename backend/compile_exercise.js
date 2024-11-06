let fs = require('fs');
let path = require('path');

let exercisesDir = path.join(__dirname, 'exercises');
let outputFile = path.join(__dirname, 'exercises.json');

let combinedData = [];

// Function to read files recursively
let readFilesRecursively = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        let filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            // If directory, recursively call function
            readFilesRecursively(filePath);
        } else if (path.extname(file) === '.json') {
            // If file is a JSON file, read and parse
            //console.log('Reading file:', filePath);
            let fileData = fs.readFileSync(filePath, 'utf8');
            combinedData.push(JSON.parse(fileData));
        }
    });
};

// Start reading from the root exercises directory
readFilesRecursively(exercisesDir);

// Write combined data to output file
fs.writeFileSync(outputFile, JSON.stringify(combinedData, null, 2), 'utf8');
console.log('JSON files have been combined!');
