const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync, spawnSync } = require("child_process");
const pdfParse = require("pdf-parse");

/**
 * Extract text from PDF - handles both text-based and image-based (scanned) PDFs
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} Extracted text from the PDF
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    console.log("📄 Attempting PDF text extraction...");
    
    // First, try using pdftotext command if available (fastest for text PDFs)
    try {
      const extractedText = await extractUsingPdfToText(pdfBuffer);
      if (extractedText.length > 100) {
        console.log(
          `✅ Successfully extracted ${extractedText.length} characters via pdftotext`
        );
        return extractedText;
      }
    } catch (err) {
      console.log("ℹ️ pdftotext not available, trying PDF.js extraction...");
    }

    // Try pure JavaScript extraction using pdf-parse
    try {
      const jsText = await extractTextUsingPdfJs(pdfBuffer);
      if (jsText.length > 50) {
        console.log(
          `✅ Successfully extracted ${jsText.length} characters via pdf-parse`
        );
        return jsText;
      } else if (jsText.length > 0) {
        console.log(`✓ pdf-parse extracted ${jsText.length} characters (minimal but valid)`);
        return jsText;
      }
    } catch (err) {
      console.error("❌ pdf-parse extraction error:", err.message);
      console.log("ℹ️ pdf-parse failed, trying OCR...");
    }

    // If still nothing, try OCR
    try {
      console.log("🔄 Attempting OCR extraction for PDF...");
      const ocrText = await extractTextFromPDFUsingOCR(pdfBuffer);
      if (ocrText.length > 0) {
        console.log(
          `✅ Successfully extracted ${ocrText.length} characters via OCR`
        );
        return ocrText;
      }
    } catch (ocrErr) {
      console.log("ℹ️ OCR extraction failed");
    }

    throw new Error("Could not extract text from PDF");
  } catch (err) {
    console.error("❌ PDF text extraction error:", err.message);
    throw new Error(
      "Could not extract text from PDF. Possible causes: (1) PDF is a scanned image without text layer, (2) PDF is corrupted or encrypted. Try uploading a different PDF or ensure it contains selectable text."
    );
  }
}

/**
 * Extract text using pdftotext command
 */
async function extractUsingPdfToText(pdfBuffer) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-extract-"));
  const tempPdfPath = path.join(tempDir, "temp.pdf");
  const tempTxtPath = path.join(tempDir, "output.txt");

  try {
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Use pdftotext to extract text
    try {
      execSync(`pdftotext "${tempPdfPath}" "${tempTxtPath}"`, {
        stdio: "pipe",
      });

      if (fs.existsSync(tempTxtPath)) {
        const text = fs.readFileSync(tempTxtPath, "utf-8");
        return text.trim();
      }
    } catch (e) {
      throw new Error("pdftotext command failed");
    }

    return "";
  } finally {
    // Cleanup
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("⚠️ Failed to cleanup temp directory");
    }
  }
}

/**
 * Extract text from PDF using OCR
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} Extracted text via OCR
 */
async function extractTextFromPDFUsingOCR(pdfBuffer) {
  const tempPdfPath = path.join(os.tmpdir(), `resume-${Date.now()}.pdf`);
  let tempDir = null;

  try {
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    console.log("📝 PDF written to temp file");

    // Try to convert PDF to images
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-ocr-"));
    const imagePrefix = path.join(tempDir, "page");

    console.log("🔄 Attempting to extract PDF pages to images...");

    try {
      // Try pdftoppm (part of Poppler)
      execSync(`pdftoppm "${tempPdfPath}" "${imagePrefix}" -png`, {
        stdio: "pipe",
        timeout: 60000,
      });
      console.log("✅ Successfully extracted pages using pdftoppm");
    } catch (cmdErr) {
      console.log("ℹ️ pdftoppm not available, cannot extract images from PDF");
      // pdftoppm not available - we can't convert PDF to images without it
      // Return empty string as fallback
      return "";
    }

    // Get extracted image files
    const files = fs
      .readdirSync(tempDir)
      .filter(
        (f) =>
          f.endsWith(".png") ||
          f.endsWith(".jpg") ||
          f.endsWith(".jpeg") ||
          f.endsWith(".ppm")
      )
      .sort();

    if (files.length === 0) {
      console.log("ℹ️ No images extracted from PDF pages");
      // Return empty since we can't process further without images
      return "";
    }

    console.log(`📸 Found ${files.length} pages to process via OCR...`);

    // Process each page with OCR (limit to 10 pages to avoid timeout)
    let allText = "";
    const maxPages = Math.min(files.length, 10);

    for (let i = 0; i < maxPages; i++) {
      const imagePath = path.join(tempDir, files[i]);
      console.log(`🔍 Processing page ${i + 1}/${maxPages}...`);

      try {
        const imageBuffer = fs.readFileSync(imagePath);
        const pageText = await performOCROnBuffer(imageBuffer, i + 1);
        if (pageText) {
          allText += pageText + "\n";
        }
      } catch (pageErr) {
        console.warn(`⚠️ Error on page ${i + 1}:`, pageErr.message);
        continue;
      }
    }

    if (maxPages < files.length) {
      console.log(
        `ℹ️ Processed first ${maxPages} pages (total: ${files.length})`
      );
    }

    return allText.trim();
  } catch (err) {
    console.error("❌ OCR extraction error:", err.message);
    // Return empty string - this will be handled in main function
    return "";
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        console.warn("⚠️ Failed to cleanup temp directory");
      }
    }
    if (fs.existsSync(tempPdfPath)) {
      try {
        fs.unlinkSync(tempPdfPath);
      } catch (e) {
        console.warn("⚠️ Failed to cleanup temp PDF file");
      }
    }
  }
}

/**
 * Extract text from PDF using pdf-parse library
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextUsingPdfJs(pdfBuffer) {
  try {
    console.log("📄 Extracting text using pdf-parse...");

    const data = await pdfParse(pdfBuffer);
    const text = data.text || "";
    
    if (text.trim().length > 0) {
      console.log(`✓ Extracted ${text.length} characters`);
      return text.trim();
    }
    
    throw new Error("No text extracted - PDF may be scanned/image-based");
  } catch (err) {
    console.error("❌ pdf-parse extraction error:", err.message);
    throw new Error(`pdf-parse failed: ${err.message}`);
  }
}

/**
 * Perform OCR on image buffer
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {number} pageNum - Page number for logging
 * @returns {Promise<string>} Extracted text
 */
async function performOCROnBuffer(imageBuffer, pageNum = 1) {
  try {
    const result = await Tesseract.recognize(imageBuffer, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const progress = Math.round(m.progress * 100);
          if (progress % 25 === 0 && progress > 0) {
            console.log(`  Page ${pageNum} OCR: ${progress}%`);
          }
        }
      },
    });

    const text = result.data.text || "";
    console.log(`  ✓ Page ${pageNum}: ${text.length} characters`);
    return text;
  } catch (err) {
    console.error(`❌ Page ${pageNum} OCR error:`, err.message);
    throw new Error(`Page ${pageNum} OCR failed`);
  }
}

module.exports = {
  extractTextFromPDF,
  extractTextFromPDFUsingOCR,
  performOCROnBuffer,
  extractTextUsingPdfJs,
};
