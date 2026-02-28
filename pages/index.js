import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState(1); 
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    // REMOVED: setResult(null) - Keeping this ensures the UI doesn't "blink" or reset

    try {
      const fileData = await Promise.all(files.map(async (file) => ({
        fileName: file.name,
        content: await readFileAsText(file)
      })));

      const payload = {
        input: {
          files: fileData,
          state: {
            // FIX: Correctly identifies which AI logic to trigger based on your current screen
            phase: currentPhase === 1 ? "target_discovery" : "mapping_suggestion",
            target_system: "DextrHub" 
          },
          // FIX: This hands the "Memory" (result) from Phase 2 back to the AI for Phase 3
          source_schema: result 
        }
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });

      const data = await response.json();
      
      // FIX: Added a safety check before parsing to prevent the "Kick Out" crash
      if (data.response) {
        const parsedData = JSON.parse(data.response);
        setResult(parsedData);
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("AI Error. Please check your generate.js for valid JSON formatting.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Head>
        <title>Dextr AI Studio</title>
      </Head>
      
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold">N</div>
           <span className="text-xl font-extrabold tracking-tight">Dextr AI Studio</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">Demo User</p>
              <p className="text-xs text-slate-500 font-mono">INTEGRATION LEAD</p>
           </div>
           <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">JD</div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        
        {/* PHASE 1: DEFINE TARGET */}
        {currentPhase === 1 && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-12 flex items-center justify-between">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <button className="text-slate-400 hover:text-slate-600 transition-colors">←</button>
                     <h1 className="text-4xl font-extrabold text-slate-900">Phase 1: Define Target</h1>
                     <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Schema Draft</span>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
                     📄 Save Draft
                  </button>
                  {result && (
                    <button 
                      onClick={() => setCurrentPhase(2)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all inline-flex items-center gap-2"
                    >
                      Add Transformation →
                    </button>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="mb-8">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Platform</label>
                     <div className="grid grid-cols-3 gap-3">
                        <button className="border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold py-2 rounded-md">MuleSoft</button>
                        <button className="border border-slate-200 text-slate-500 font-medium py-2 rounded-md">Boomi</button>
                        <button className="border border-slate-200 text-slate-500 font-medium py-2 rounded-md">DextrHub</button>
                     </div>
                  </div>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-12 text-center relative group">
                     <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     <p className="text-slate-600 font-medium">{files.length > 0 ? `${files.length} files selected` : "Upload Sample Files"}</p>
                  </div>
                  <button onClick={handleUpload} disabled={uploading || files.length === 0} className="w-full mt-6 py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg">
                     {uploading ? "Analyzing..." : "Process Files ⚡"}
                  </button>
               </div>

                {result && (
                  <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-500">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Target Schema Defined</h2>
                    <div className="mb-6">
                      <h3 className="font-bold text-purple-600 uppercase text-xs mb-2">Header</h3>
                      <div className="bg-slate-50 p-4 rounded grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(result.header || {}).map(([key, type]) => (
                              <div key={key} className="flex justify-between border-b pb-1">
                                  <span className="font-medium">{key}</span>
                                  <span className="text-slate-500">{typeof type === 'string' ? type : type.type}</span>
                              </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-600 uppercase text-xs mb-2">Lines</h3>
                      <div className="bg-slate-50 p-4 rounded grid grid-cols-2 gap-2 text-sm">
                          {/* Supports both 'lines' and 'line_items' for persistence */}
                          {Object.entries(result.lines || result.line_items || {}).map(([key, type]) => (
                              <div key={key} className="flex justify-between border-b pb-1">
                                  <span className="font-medium">{key}</span>
                                  <span className="text-slate-500">{typeof type === 'string' ? type : type.type}</span>
                              </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* PHASE 2: TRANSFORMATION INTERFACE */}
        {currentPhase === 2 && (
          <div className="animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setCurrentPhase(1)} className="text-slate-500 flex items-center gap-2">← Back</button>
              <button onClick={handleUpload} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Generate Mappings →</button>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <h2 className="text-2xl font-bold mb-4">Phase 2: Semantic Mapping</h2>
              {/* This is where your mapping interface from image_9d4417 logic sits */}
              <div className="space-y-4">
                {result?.suggestions?.map((s, i) => (
                  <div key={i} className="flex justify-between p-4 bg-slate-50 rounded border">
                    <span>{s.source} → {s.target}</span>
                    <span className="text-green-600 font-bold">{(s.confidence * 100).toFixed(0)}% Match</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}