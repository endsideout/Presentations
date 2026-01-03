import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const ASSETS_DIR = './public/assets';

async function optimizeImages() {
  console.log('Starting image optimization...');

  try {
    const files = await fs.readdir(ASSETS_DIR);
    
    for (const file of files) {
      if (file.match(/\.(png|jpg|jpeg)$/i)) {
        const inputPath = path.join(ASSETS_DIR, file);
        const outputPath = path.join(ASSETS_DIR, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
        
        console.log(`Processing: ${file}`);
        
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        let pipeline = image.webp({ quality: 80 });

        if (metadata.width > 1920) {
           console.log(`  Resizing from ${metadata.width}px width to 1920px`);
           pipeline = pipeline.resize({ width: 1920 });
        }

        await pipeline.toFile(outputPath);
        console.log(`  -> Converted to ${path.basename(outputPath)}`);

        // Delete original
        await fs.unlink(inputPath);
        console.log(`  -> Deleted original ${file}`);
      }
    }
    console.log('Optimization complete!');
  } catch (err) {
    console.error('Error optimizing images:', err);
  }
}

optimizeImages();
