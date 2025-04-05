import { jsPDF } from 'jspdf';

export const registerTimesNewRoman = async (doc: jsPDF) => {
  try {
    // Load font files
    const fontNormal = await fetch('/fonts/TimesNewRoman.ttf').then(res => res.arrayBuffer());
    const fontBold = await fetch('/fonts/TimesNewRomanBold.ttf').then(res => res.arrayBuffer());
    const fontItalic = await fetch('/fonts/TimesNewRomanItalic.ttf').then(res => res.arrayBuffer());
    const fontBoldItalic = await fetch('/fonts/TimesNewRomanBoldItalic.ttf').then(res => res.arrayBuffer());

    // Register fonts
    doc.addFileToVFS('TimesNewRoman.ttf', arrayBufferToBase64(fontNormal));
    doc.addFont('TimesNewRoman.ttf', 'TimesNewRoman', 'normal');
    
    doc.addFileToVFS('TimesNewRomanBold.ttf', arrayBufferToBase64(fontBold));
    doc.addFont('TimesNewRomanBold.ttf', 'TimesNewRoman', 'bold');
    
    doc.addFileToVFS('TimesNewRomanItalic.ttf', arrayBufferToBase64(fontItalic));
    doc.addFont('TimesNewRomanItalic.ttf', 'TimesNewRoman', 'italic');
    
    doc.addFileToVFS('TimesNewRomanBoldItalic.ttf', arrayBufferToBase64(fontBoldItalic));
    doc.addFont('TimesNewRomanBoldItalic.ttf', 'TimesNewRoman', 'bolditalic');
    
  } catch (error) {
    console.error('Failed to load Times New Roman fonts:', error);
    throw error;
  }
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}