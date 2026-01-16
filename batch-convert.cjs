const webp = require('webp-converter');
const fs = require('node:fs');
const path = require('node:path');

function convertAllImages(dir, outputBaseDir) {
  if (!fs.existsSync(outputBaseDir)) fs.mkdirSync(outputBaseDir, { recursive: true });

  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Créer le sous-dossier de sortie correspondant
      const outputSubDir = path.join(outputBaseDir, item);
      convertAllImages(itemPath, outputSubDir);
    } else if (stat.isFile() && !item.endsWith('.webp')) {
      // Convertir tous les fichiers qui ne sont pas déjà en webp
      const input = itemPath;
      const output = path.join(outputBaseDir, item.replace(/\.[^/.]+$/, '.webp'));

      webp.cwebp(input, output, '-q 80 -lossless')
        .then(() => {
          console.log(`${item} converti avec succès`);
        })
        .catch(err => {
          console.error(`Erreur conversion ${item}:`, err.message);
        });
    }
  });
}

const inputDir = 'src/assets/images';
const outputDir = 'dist/assets/images';

convertAllImages(inputDir, outputDir);
