#!/usr/bin/env node

/**
 * SVG to JPG Converter
 * Converts SVG files in the assets directory to JPG format
 * 
 * Installation: npm install sharp
 * Usage: node convert-svg-to-jpg.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgFiles = [
  'assets/df-wordmark.svg',
  'assets/logo.svg',
  'assets/logo-mark.svg',
  'assets/favicon.svg'
];

async function convertSvgToJpg() {
  for (const svgFile of svgFiles) {
    try {
      const jpgFile = svgFile.replace('.svg', '.jpg');
      
      await sharp(svgFile, { density: 300 })
        .jpeg({ quality: 95, progressive: true })
        .toFile(jpgFile);
      
      console.log(`✓ Converted: ${svgFile} → ${jpgFile}`);
    } catch (error) {
      console.error(`✗ Error converting ${svgFile}:`, error.message);
    }
  }
}

convertSvgToJpg();
