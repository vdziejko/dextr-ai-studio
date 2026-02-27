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
    setResult(null);

    try {
      const fileContents = await Promise.all(files.map(readFileAsText));
      const combinedData = fileContents.join("\n\n---\n\n");

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: combinedData }),
      });

      const data = await response.json();
      setResult(data.response ? JSON.parse(data.response) : null);
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Error processing files.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Head>
        <title>Dextr AI Studio</title>
      </Head>

      {/* Navbar - Persistent across phases */}
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
                <button className="bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-all flex items-center gap-2">
                  🚀 Publish Schema
                </button>
                <button
                  onClick={() => setCurrentPhase(2)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all inline-flex items-center gap-2"
                >
                  Add Transformation →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Upload UI */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
                  <input type="text" defaultValue="order_1_line" className="w-full text-lg font-semibold text-slate-800 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Platform</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold py-2 rounded-md">MuleSoft</button>
                    <button className="border border-slate-200 text-slate-500 font-medium py-2 rounded-md hover:border-slate-300">Boomi</button>
                    <button className="border border-slate-200 text-slate-500 font-medium py-2 rounded-md hover:border-slate-300">DextrHub</button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative group h-64 flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="pointer-events-none">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    </div>
                    <p className="text-slate-600 font-medium">Drag & drop your header/line CSVs</p>
                    <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 z-10">
                      <p className="text-slate-800 font-bold">{files.length} file(s) selected</p>
                      <p className="text-red-500 text-xs font-bold mt-2 uppercase tracking-wide cursor-pointer z-20 relative" onClick={(e) => { e.preventDefault(); setFiles([]); }}>× Clear All</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading || files.length === 0}
                  className={`w-full mt-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
                    uploading || files.length === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200"
                  }`}
                >
                  {uploading ? "Analyzing Structure..." : "Process Files ⚡"}
                </button>
              </div> {/* End of Left Column */}
            </div> {/* End of grid-cols-1 lg:grid-cols-2 */}
          </div> /* End of animate-in */
        )}
      </main>
    </div>
  );
}