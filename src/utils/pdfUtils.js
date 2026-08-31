/**
 * Document & PDF Page Detection Utilities
 * Reads actual file buffers client-side to extract or estimate page counts accurately.
 */

export const detectPagesFromFile = async (file) => {
  if (!file) return { pages: 1, method: 'default' };

  const fileName = file.name.toLowerCase();

  // 1. PDF Real Page Extraction
  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const text = new TextDecoder('latin1').decode(bytes);

      // Method A: Count /Type /Page occurrences (ensuring not /Pages)
      const pageMatches = text.match(/\/Type\s*\/Page(?=[\s\/\>\]])/g);
      if (pageMatches && pageMatches.length > 0) {
        return {
          pages: pageMatches.length,
          method: 'pdf_parsed',
          sizeFormatted: formatFileSize(file.size),
        };
      }

      // Method B: Match /Count <number> in the /Pages catalog
      const countMatches = [...text.matchAll(/\/Type\s*\/Pages[\s\S]{1,200}?\/Count\s+(\d+)/g)];
      if (countMatches.length > 0) {
        // Take the highest count found in the catalog
        const counts = countMatches.map(m => parseInt(m[1], 10)).filter(c => !isNaN(c) && c > 0);
        if (counts.length > 0) {
          return {
            pages: Math.max(...counts),
            method: 'pdf_catalog',
            sizeFormatted: formatFileSize(file.size),
          };
        }
      }

      // Method C: Secondary /Count pattern
      const singleCountMatch = text.match(/\/Count\s+(\d+)/);
      if (singleCountMatch && singleCountMatch[1]) {
        const count = parseInt(singleCountMatch[1], 10);
        if (count > 0 && count < 2000) {
          return {
            pages: count,
            method: 'pdf_count',
            sizeFormatted: formatFileSize(file.size),
          };
        }
      }
    } catch (err) {
      console.warn('PDF page detection fallback:', err);
    }

    // PDF Fallback by size
    const estPages = Math.max(1, Math.min(150, Math.round(file.size / 45000)));
    return {
      pages: estPages,
      method: 'estimated',
      sizeFormatted: formatFileSize(file.size),
    };
  }

  // 2. PPTX / Presentations (slides)
  if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
    const estSlides = Math.max(1, Math.min(100, Math.round(file.size / 60000)));
    return {
      pages: estSlides,
      method: 'estimated_slides',
      sizeFormatted: formatFileSize(file.size),
    };
  }

  // 3. Word Docs (DOCX / DOC)
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const estDocPages = Math.max(1, Math.min(80, Math.round(file.size / 35000)));
    return {
      pages: estDocPages,
      method: 'estimated_doc',
      sizeFormatted: formatFileSize(file.size),
    };
  }

  // 4. Image Files (Single Page)
  if (file.type.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|webp|bmp)$/)) {
    return {
      pages: 1,
      method: 'single_image',
      sizeFormatted: formatFileSize(file.size),
    };
  }

  // 5. Default calculation
  return {
    pages: Math.max(1, Math.min(50, Math.round(file.size / 50000))),
    method: 'estimated',
    sizeFormatted: formatFileSize(file.size),
  };
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
