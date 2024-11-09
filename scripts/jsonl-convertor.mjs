#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Get the file path from command-line arguments
const [,, inputFilePath] = process.argv;

if (!inputFilePath) {
  console.error("Please provide a JSON file to convert.");
  process.exit(1);
}

// Generate the output file path with a `.jsonl.json` extension
const outputFilePath = `${inputFilePath.replace(/\.json$/, '')}.jsonl.json`;

try {
  // Read the JSON file
  const data = await fs.readFile(inputFilePath, 'utf8');
  
  // Parse JSON data
  const jsonData = JSON.parse(data);

  // Check if the JSON data is an array
  if (!Array.isArray(jsonData)) {
    console.error("JSON data is not an array, cannot convert to JSONL.");
    process.exit(1);
  }

  // Write each object as a line in the JSONL file
  const jsonlData = jsonData.map(item => JSON.stringify(item)).join('\n');

  // Save to the output file
  await fs.writeFile(outputFilePath, jsonlData, 'utf8');
  console.log(`Successfully converted JSON to JSONL format. Output saved as ${outputFilePath}`);
  
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}