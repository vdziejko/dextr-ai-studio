// utils/parser.js

/**
 * Main entry point for file analysis.
 * Identifies file type and routes to the correct sub-parser.
 */
export const analyzeSourceFile = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const rawContent = await readFileContent(file);
  
    switch (extension) {
      case 'csv':
        return parseCSV(rawContent);
      case 'json':
        return parseJSON(rawContent);
      case 'xml':
        return parseXML(rawContent);
      default:
        throw new Error("Unsupported file format. Please use CSV, JSON, or XML.");
    }
  };
  
  /**
   * Helper to read file as text
   */
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  
  // --- Format Specific "Sniffers" ---
  
  const parseCSV = (content) => {
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    const firstRow = lines[1] ? lines[1].split(',') : [];
    
    const headerObj = {};
    headers.forEach((h, i) => {
      headerObj[h.trim()] = firstRow[i] ? firstRow[i].trim() : "";
    });
  
    return { header: headerObj, lines: [] }; 
  };
  
  const parseJSON = (content) => {
    const data = JSON.parse(content);
    const header = {};
    let lines = [];
  
    // Logic: Identify which keys are values (Header) and which are Arrays (Lines)
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        lines = data[key]; // Found the repeating lines
      } else if (typeof data[key] !== 'object') {
        header[key] = data[key]; // Found a header value
      }
    });
  
    return { header, lines };
  };
  
  const parseXML = (content) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    const header = {};
    let lines = [];
  
    const getNodeText = (node) => node.childNodes[0]?.nodeValue || "";
  
    // Get all first-level children of the root element
    const rootChildren = Array.from(xmlDoc.documentElement.children);
    
    rootChildren.forEach(node => {
      if (node.children.length > 0) {
        // Logic: If it has children, check if they are repeating "Lines"
        const subItems = Array.from(node.children);
        if (subItems.length > 1 && subItems[0].tagName === subItems[1].tagName) {
          lines = subItems.map(item => {
            const row = {};
            Array.from(item.children).forEach(child => {
              row[child.tagName] = getNodeText(child);
            });
            return row;
          });
        } else {
          // If it's a single nested object, treat it as part of the header
          Array.from(node.children).forEach(child => {
            header[`${node.tagName}/${child.tagName}`] = getNodeText(child);
          });
        }
      } else {
        // Standard top-level Header field
        header[node.tagName] = getNodeText(node);
      }
    });
  
    return { header, lines };
  };