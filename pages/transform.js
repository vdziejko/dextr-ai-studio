import React, { useState } from 'react';
import { analyzeSourceFile } from '../utils/parser'; // Connects to your logic file
import Link from 'next/link';

export default function Transform() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceData, setSourceData] = useState({ header: {}, lines: [] });
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Handles selecting the file from your computer
  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsAnalyzed(false); // Reset status if a new file is uploaded
    }
  };

  // The main action trigger
  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please upload a sample file first.");
      return;
    }

    try {
      const result = await analyzeSourceFile(selectedFile);
      setSourceData(result);
      setIsAnalyzed(true);
      console.log("Analysis successful:", result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Error analyzing file. Check the console for details.");
    }
  };

  return (
    <div className="p-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-500">←</Link>
        <h1 className="text-2xl font-bold text-slate-800">Phase 2: Load Source</h1>
        {isAnalyzed && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            ✓ SOURCE ANALYZED
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column: Upload & Action */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Upload Internal Sample</h2>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center mb-6">
             <input 
              type="file" 
              onChange={onFileChange} 
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && <p className="mt-4 text-sm text-slate-600">Selected: {selectedFile.name}</p>}
          </div>
          
          <button 
            onClick={handleAnalyze}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
          >
            Analyze Source Data
          </button>
        </div>

        {/* Right Column: Results Tree */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Source Fields (Internal)</h2>
          {!isAnalyzed ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
               <p>Awaiting Context</p>
            </div>
          ) : (
            <div className="space-y-4">
               {/* This is where we will render the Header + Lines tree in the next step */}
               <p className="text-sm text-green-600 font-medium">Data ready for mapping.</p>
               <pre className="text-xs bg-slate-50 p-4 rounded overflow-auto">
                 {JSON.stringify(sourceData, null, 2)}
               </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}