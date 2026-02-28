import "@/styles/globals.css";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Menu, X, Search, Plus, FileJson, 
  ArrowRight, Database, Layers, CheckCircle, 
  Clock, AlertCircle, Zap, Code, Home, Settings, 
  ChevronDown, Table, Share2, Sparkles, Save, FolderOpen,
  Download, Copy, Rocket, Send, Edit3, MoreHorizontal,
  Box, Globe, Server, ArrowLeft, ExternalLink, Package, Lock, 
  MessageSquare, BookOpen, XCircle, FileSpreadsheet, PlusCircle,
  ChevronLeft, ChevronRight, Link, Trash2
} from 'lucide-react';
import { analyzeSourceFile } from '../utils/parser';

// --- MAIN APP COMPONENT ---
export default function App({ Component, pageProps }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 1. PROJECT REGISTRY
  const [projects, setProjects] = useState([
    { 
      id: 'p1', 
      name: 'Netsuite Invoices v2', 
      target: 'MuleSoft', 
      status: 'Published', 
      phases: { t: true, s: true, m: true, e: true },
      artifacts: { schema: { order_id: "integer" } }
    },
    { 
      id: 'p2', 
      name: 'Salesforce Leads Sync', 
      target: 'Boomi', 
      status: 'Draft', 
      phases: { t: true, s: true, m: false, e: false },
      artifacts: { schema: null }
    }
  ]);

  const [activeProject, setActiveProject] = useState(null);

  // --- NAVIGATION & STATE MANAGEMENT ---
  const startNewProject = () => {
    setActiveProject(null); 
    setCurrentView('phase1');
  };

  const resumeProject = (project, targetView) => {
    setActiveProject(project);
    setCurrentView(targetView || 'phase1');
  };

  const goToExport = (project) => {
    setActiveProject(project);
    setCurrentView('phase4');
  };

  const updateOraryProject = (name, target, schema, status, phases) => {
    if (activeProject) {
      const updatedList = projects.map(p => 
        p.id === activeProject.id 
          ? { ...p, name, target, status, phases, artifacts: { ...p.artifacts, schema } } 
          : p
      );
      setProjects(updatedList);
      setActiveProject(updatedList.find(p => p.id === activeProject.id));
    } else {
      const newProj = { 
        id: `p${Date.now()}`, 
        name: name || "Untitled Project", 
        target: target || 'DextrHub', 
        status: status, 
        phases: phases, 
        artifacts: { schema } 
      };
      setProjects([newProj, ...projects]);
      setActiveProject(newProj);
    }
  };

  // Phase 1 Handlers
  const handleSaveDraft_P1 = (name, target, schema) => {
    updateOraryProject(name, target, schema, 'Draft', { t: true, s: false, m: false, e: false });
  };

  const handleQuickPublish_P1 = (name, target, schema) => {
    updateOraryProject(name, target, schema, 'Published', { t: true, s: false, m: false, e: false });
  };

// Phase 2 Handler: Now supports "Auto-Save"
const handleSaveSource = (data, shouldNavigate = true) => {
  if (!activeProject) return;
  
  const updatedPhases = { ...activeProject.phases, s: true };
  const updatedProject = { 
    ...activeProject, 
    phases: updatedPhases, 
    artifacts: { ...activeProject.artifacts, sourceFields: data } 
  };
  
  const updatedList = projects.map(p => p.id === activeProject.id ? updatedProject : p);
  
  setProjects(updatedList);
  setActiveProject(updatedProject);
  
  // Only move to Phase 3 if we explicitly click the "Go to Mapping" button
  if (shouldNavigate) setCurrentView('phase3'); 
};

  // Phase 3 Handlers: Updated to save your real work
  const handleSaveDraft_P3 = (mappings, prompt) => {
    if (!activeProject) return;
    const updatedPhases = { ...activeProject.phases, m: true, e: false }; 
    const updatedList = projects.map(p => 
      p.id === activeProject.id 
        ? { 
            ...p, 
            phases: updatedPhases, 
            artifacts: { ...p.artifacts, mappings, prompt } // 👈 SAVES YOUR MAPPINGS AND RULES
          } 
        : p
    );
    setProjects(updatedList);
    setActiveProject({ 
      ...activeProject, 
      phases: updatedPhases, 
      artifacts: { ...activeProject.artifacts, mappings, prompt } 
    });
  };

  const handlePublishTransformation = (mappings, prompt, generatedCode = null) => {
    if (!activeProject) return;
    const updatedPhases = { ...activeProject.phases, m: true, e: true };
    const updatedProject = { 
      ...activeProject, 
      status: 'Published',
      phases: updatedPhases, 
      artifacts: { 
        ...activeProject.artifacts, 
        mappings, 
        prompt,
        // 🚀 Add this line to store the code if it's passed
        generatedCode: generatedCode || activeProject.artifacts.generatedCode 
      } 
    };
    
    const updatedList = projects.map(p => p.id === activeProject.id ? updatedProject : p);
    
    setProjects(updatedList);
    setActiveProject(updatedProject);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 overflow-hidden text-sm font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* --- HEADER --- */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 z-30 relative shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-md transition-all flex items-center gap-1 ${isMenuOpen ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              <ChevronDown size={14} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMenuOpen && (
              <div className="absolute top-12 left-0 w-64 bg-white border border-slate-200 shadow-2xl rounded-xl py-2 z-50 animate-in slide-in-from-top-2 text-left">
                <DropdownItem icon={<Home size={18} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setIsMenuOpen(false);}} />
                <DropdownItem icon={<Database size={18} />} label="Phase 1: Target" active={currentView === 'phase1'} onClick={() => {setCurrentView('phase1'); setIsMenuOpen(false);}} />
                <DropdownItem icon={<Code size={18} />} label="Phase 2: Source" active={currentView === 'phase2'} onClick={() => {setCurrentView('phase2'); setIsMenuOpen(false);}} />
                <DropdownItem icon={<Share2 size={18} />} label="Phase 3: Map & Logic" active={currentView === 'phase3'} onClick={() => {setCurrentView('phase3'); setIsMenuOpen(false);}} />
                <DropdownItem icon={<Rocket size={18} />} label="Phase 4: Export" active={currentView === 'phase4'} onClick={() => {setCurrentView('phase4'); setIsMenuOpen(false);}} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Dextr AI Studio</span>
          </div>
        </div>

        {activeProject && currentView !== 'dashboard' && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600">Active: {activeProject.name}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-sm font-bold text-slate-900">Demo User</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Integration Lead</p>
          </div>
          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold border border-indigo-100 shadow-inner">JD</div>
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 relative">
        {currentView === 'dashboard' && (
          <DashboardView 
            projects={projects} 
            onNewProject={startNewProject} 
            onOpenProject={resumeProject}
            onExportProject={goToExport} 
          />
        )}
        
        {currentView === 'phase1' && (
          <Phase1View 
            activeProject={activeProject}
            onNext={(p) => { 
              if (!activeProject) setActiveProject({ ...p, id: `p${Date.now()}` }); 
              else setActiveProject({ ...activeProject, ...p });
              setCurrentView('phase2'); 
            }} 
            onQuickPublish={handleQuickPublish_P1}
            onSaveDraft={handleSaveDraft_P1}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'phase2' && (
          <Phase2View 
            activeProject={activeProject} 
            projects={projects} 
            onSelectProject={setActiveProject} 
            onNext={handleSaveSource} 
            onBack={() => setCurrentView('dashboard')}
            onPrev={() => setCurrentView('phase1')}
          />
        )}

        {currentView === 'phase3' && (
          <Phase3View 
            activeProject={activeProject}
            onPublish={handlePublishTransformation} 
            onSaveDraft={handleSaveDraft_P3}
            onGoToExport={() => setCurrentView('phase4')}
            onBack={() => setCurrentView('dashboard')}
            onPrev={() => setCurrentView('phase2')}
          />
        )}
        
        {currentView === 'phase4' && (
          <Phase4View 
            activeProject={activeProject}
            onBack={() => setCurrentView('dashboard')}
            onPrev={() => setCurrentView('phase3')}
          />
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const DropdownItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-sm font-bold border-l-4 ${active ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}>
    {icon} <span>{label}</span>
  </button>
);

const NavControls = ({ onBack, onPrev }) => (
  <div className="flex items-center gap-1 mr-4 border-r border-slate-200 pr-4">
    <button onClick={onBack} title="Back to Dashboard" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
      <ArrowLeft size={20} />
    </button>
    {onPrev && (
      <button onClick={onPrev} title="Previous Step" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
        <ChevronLeft size={20} />
      </button>
    )}
  </div>
);

const StatusBadge = ({ label, active }) => (
  <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wide border ${active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
    {active ? <CheckCircle size={12} /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
    {label}
  </div>
);

const DashboardView = ({ projects, onNewProject, onOpenProject, onExportProject }) => (
  <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Integration Projects</h1><p className="text-slate-500 font-medium mt-2">Manage your target schemas and transformation maps.</p></div>
      <button onClick={onNewProject} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all"><Plus size={20} /> Create New Project</button>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            <th className="px-6 py-5">Project Name</th>
            <th className="px-6 py-5">Component Status</th>
            <th className="px-6 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-5 font-bold text-slate-900 w-1/3">
                {p.name}
                <div className="flex gap-2 mt-2">
                   <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-bold uppercase">{p.target}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex flex-col gap-2 items-start">
                  <div className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold border ${p.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    <Database size={12} /> {p.status === 'Published' ? "Target Schema: Ready" : "Target Schema: Draft"}
                  </div>
                  <div className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold border ${
                    p.phases.e ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    p.phases.m ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    <Share2 size={12} /> 
                    {p.phases.e ? "Transformation: Live" : 
                     p.phases.m ? "Transformation: Draft" : 
                     "Transformation: Pending"}
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <ActionBtn icon={<Edit3 size={14} />} label="Schema" onClick={() => onOpenProject(p, 'phase1')} title="Edit Target Schema" />
                  <ActionBtn icon={<Share2 size={14} />} label="Map" onClick={() => onOpenProject(p, 'phase2')} disabled={!p.phases.t} title="Edit Transformation" />
                  <ActionBtn icon={<ExternalLink size={14} />} label="Export" onClick={() => onExportProject(p)} disabled={!p.phases.e} title="Export Artifacts" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ActionBtn = ({ icon, label, onClick, disabled, title }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    title={title}
    className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold transition-all ${
      disabled 
      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 active:scale-95 shadow-sm'
    }`}
  >
    {icon} {label}
  </button>
);

const Phase1View = ({ activeProject, onNext, onQuickPublish, onSaveDraft, onBack }) => {
  const [generatedSchema, setGeneratedSchema] = useState(activeProject?.artifacts?.schema || null);
  const [schemaString, setSchemaString] = useState(activeProject?.artifacts?.schema ? JSON.stringify(activeProject.artifacts.schema, null, 4) : "");
  const [isJsonValid, setIsJsonValid] = useState(true); // NEW: Track if the JSON is broken
  const [isProcessing, setIsProcessing] = useState(false);
  const [projName, setProjName] = useState(activeProject?.name || "");
  const [platform, setPlatform] = useState(activeProject?.target || "MuleSoft");
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const fileInputRef = useRef(null);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const handleDownloadSchema = () => {
    if (!generatedSchema) return;
    const schemaString = JSON.stringify(generatedSchema, null, 2);
    const blob = new Blob([schemaString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projName.replace(/\s+/g, '_')}_${platform}_Target.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleGenerate = async () => {
    if (selectedFiles.length === 0) {
      alert("Please upload at least one sample file first.");
      return;
    }
    setIsProcessing(true);
    try {
      const fileDataPromises = selectedFiles.map(file => {
        return new Promise((resolve) => {
          const r = new FileReader();
          r.onload = (e) => resolve({ fileName: file.name, content: e.target.result });
          r.readAsText(file);
        });
      });
      const preparedFiles = await Promise.all(fileDataPromises);
      const inputPayload = {
        actions_completed: ["upload_source_sample"],
        state: { phase: "mapping_discovery", target_system: platform },
        files: preparedFiles, 
        user_context: `Dextr AI Suite processing ${selectedFiles.length} files for project: ${projName}`
      };
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputPayload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI Processing Failed');
      setConfidenceScore(data.confidence_score || 0.98); 
      let aiSchema = data.response;
      if (typeof aiSchema === 'string') {
        try { aiSchema = JSON.parse(aiSchema); } catch (e) { console.log("Standard text response received"); }
      }
      setGeneratedSchema(aiSchema);
      setSchemaString(JSON.stringify(aiSchema, null, 4)); // Updates the text editor
    } catch (err) {
      console.error("Dextr API Error:", err);
      alert("Dextr AI Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files); 
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]); 
    }
  };
  const clearFiles = (e) => {
    e.stopPropagation(); 
    setSelectedFiles([]); 
  };
  // NEW: Handles manual typing in the black box
  const handleSchemaTextChange = (newText) => {
    setSchemaString(newText);
    try {
      const parsed = JSON.parse(newText);
      setGeneratedSchema(parsed);
      setIsJsonValid(true); // JSON is healthy!
    } catch (e) {
      setIsJsonValid(false); // User made a typo (missing comma, bracket, etc.)
    }
  };
  const isPublished = activeProject?.status === 'Published';
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-500 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <NavControls onBack={onBack} />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mr-4">Phase 1: Define Target</h1>
          {generatedSchema && <StatusBadge label={isPublished ? "Schema Published" : "Schema Draft"} active={isPublished} />}
        </div>
        
        {generatedSchema && (
          <div className="flex gap-2">
            <button onClick={() => onSaveDraft(projName, platform, generatedSchema)} className="text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all active:scale-95"><Save size={14} /> Save Draft</button>
            <button onClick={() => onQuickPublish(projName, platform, generatedSchema)} className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-indigo-50 transition-all active:scale-95"><Rocket size={14} /> Publish Schema</button>
            <button 
              disabled={!isJsonValid} 
              onClick={() => onNext({ id: activeProject?.id, name: projName, target: platform, artifacts: { schema: generatedSchema }, phases: { t: true, s: false, m: false, e: false }})} 
              className={`px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 ${!isJsonValid ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              Add Transformation &rarr;
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
        {/* Left Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-8 gap-6 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Project Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none font-bold" 
              value={projName} 
              onChange={(e) => setProjName(e.target.value)} 
              placeholder="e.g. Outbound Customer Standard" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Target Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {['MuleSoft', 'Boomi', 'DextrHub'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    platform === p 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-2xl flex-1 flex flex-col items-center justify-center text-center hover:bg-blue-50/30 transition-all cursor-pointer"
          >
            <Upload className="text-blue-600 mb-4" size={32} />
            <p className="font-bold text-slate-800 text-xs uppercase tracking-wide px-4">
              {selectedFiles.length > 0 ? (
                <span className="flex flex-col items-center gap-2">
                  <span>Selected: {selectedFiles.length} file(s) ({selectedFiles.map(f => f.name).join(', ')})</span>
                  <button 
                    onClick={clearFiles}
                    className="text-red-500 hover:text-red-700 text-[10px] font-black underline transition-colors"
                  >
                    × CLEAR ALL FILES
                  </button>
                </span>
              ) : (
                "Import Target Sample(s)"
              )}
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              accept=".csv,.json,.xml"
            />
          </div>
          <button onClick={handleGenerate} disabled={isProcessing || generatedSchema} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl disabled:bg-slate-300 transition-all">
            {isProcessing ? 'AI Generating Schema...' : (generatedSchema ? 'Schema Defined' : 'Generate Target Schema')}
          </button>
        </div>
        {/* Right Column Wrapper */}
        <div className="flex flex-col">
        <div className="bg-slate-900 rounded-2xl p-8 overflow-hidden border border-slate-800 shadow-2xl relative flex-1 flex flex-col">
            
            {/* 🎯 AI CONFIDENCE GAUGE - PINNED BOTTOM RIGHT */}
            {confidenceScore && (
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700 animate-in zoom-in-95">
                <div className="relative w-10 h-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-slate-700" strokeWidth="3" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                    <circle 
                      className="text-emerald-400 transition-all duration-1000 ease-out" 
                      strokeWidth="3" 
                      strokeDasharray={`${confidenceScore * 100}, 100`} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="16" cx="18" cy="18" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                    {Math.round(confidenceScore * 100)}%
                  </div>
                </div>
                <div className="leading-tight text-left">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Master Match</p>
                  <p className="text-[10px] font-black text-emerald-400 uppercase leading-tight">Verified 1.0</p>
                </div>
              </div>
            )}
            {/* 🏷️ STATUS BADGE - PINNED TOP RIGHT */}
            {activeProject?.artifacts?.schema && (
              <>
                {/* ⚠️ INVALID JSON WARNING */}
                {!isJsonValid && (
                  <div className="absolute top-12 right-4 z-30 bg-red-900/80 text-red-100 text-[10px] px-3 py-1 rounded-md font-bold uppercase tracking-widest flex items-center gap-2 border border-red-500 animate-pulse backdrop-blur-sm shadow-lg">
                    <AlertCircle size={12} /> Syntax Error: Invalid JSON
                  </div>
                )}
                
                {/* STATUS BADGE */}
                <div className={`absolute top-4 right-4 z-20 ${isPublished ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/50' : 'bg-slate-800/50 text-slate-400 border-slate-600/50'} text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-2 border animate-in fade-in duration-300 shadow-lg backdrop-blur-sm`}>
                  {isPublished ? <Rocket size={12} /> : <CheckCircle size={12} />}
                  {isPublished ? (isPublished ? "Published Schema" : "Loaded from Draft") : "Schema Draft"}
                </div>
              </>
            )}
            {/* 📜 SCROLLABLE CONTENT */}
            {generatedSchema ? (
              <textarea 
                className={`w-full h-full bg-transparent text-xs font-mono text-emerald-400 text-left leading-loose outline-none resize-none border-none p-0 focus:ring-0 ${isPublished ? 'cursor-not-allowed opacity-80' : 'cursor-text'}`}
                spellCheck="false"
                disabled={isPublished} // Locks editing if Published
                value={schemaString}
                onChange={(e) => handleSchemaTextChange(e.target.value)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-[10px]">
                Awaiting Definition
              </div>
            )}
          </div>
          {/* 📄 PHASE 1 EXPORT ARTIFACTS - WHITE BOX */}
      {generatedSchema && (
        <div className="mt-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500 text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export Target Artifacts</h3>
            {!isPublished && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-tight bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                <Lock size={10} /> Publish to Unlock
              </span>
            )}
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleDownloadSchema}
              disabled={!isPublished}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                isPublished 
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-100' 
                : 'bg-slate-50/50 border-slate-100 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-white rounded-lg shadow-sm transition-colors ${isPublished ? 'group-hover:text-indigo-600' : 'text-slate-300'}`}>
                  <FileJson size={18} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isPublished ? 'text-slate-700' : 'text-slate-400'}`}>
                    Download {platform} Schema
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                    {isPublished ? 'Standard JSON Definition' : 'Draft stage locked'}
                  </p>
                </div>
              </div>
              {isPublished ? (
                <Download size={16} className="text-slate-300 group-hover:text-slate-500" />
              ) : (
                <Lock size={16} className="text-slate-200" />
              )}
            </button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

const Phase2View = ({ activeProject, projects, onSelectProject, onNext, onBack, onPrev }) => {
  // 1. Initialize from existing project artifacts
  const [sourceData, setSourceData] = useState(activeProject?.artifacts?.sourceFields || { header: {}, lines: [] });
  const [isAnalyzed, setIsAnalyzed] = useState(activeProject?.phases?.s || false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const isPublished = activeProject?.phases?.e === true;
  const isLocked = activeProject?.phases?.m === true || isPublished;

  // 2. THE SYNC HOOK: Ensures the table fills up when you return to this page
  useEffect(() => {
    if (activeProject?.artifacts?.sourceFields) {
      setSourceData(activeProject.artifacts.sourceFields);
      setIsAnalyzed(true);
    } else {
      setSourceData({ header: {}, lines: [] });
      setIsAnalyzed(false);
    }
  }, [activeProject]);

  // 🗑️ Surgical addition: Reset local state
  const handleClearFile = (e) => {
    e.stopPropagation(); 
    setSelectedFile(null);
    setSourceData({ header: {}, lines: [] });
    setIsAnalyzed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateField = (section, key, field, newValue) => {
    if (isLocked) return;
    const newData = { ...sourceData };
    if (section === 'header') {
      if (!newData.header[key]) newData.header[key] = {}; 
      newData.header[key][field] = newValue;
    } else {
      if (!newData.lines[0][key]) newData.lines[0][key] = {}; 
      newData.lines[0][key][field] = newValue;
    }
    setSourceData(newData);
  };

  const handleAnalyze = async () => {
    if (!activeProject || !selectedFile) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      const fileContent = await new Promise(res => {
        reader.onload = (e) => res(e.target.result);
        reader.readAsText(selectedFile);
      });

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { 
          state: { phase: "source_analysis" }, 
          files: [{ fileName: selectedFile.name, content: fileContent }] 
        } })
      });

      const data = await response.json();
      const result = JSON.parse(data.response);
      
      setSourceData(result);
      setIsAnalyzed(true);
      onNext(result, false); // Auto-save logic
    } catch (err) {
      alert("AI Analysis Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const eligibleProjects = projects.filter(p => p.phases.t);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-500 text-left">
      <div className="flex justify-between items-center text-left">
        <div className="flex items-center gap-4">
          <NavControls onBack={onBack} onPrev={onPrev} />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Phase 2: Load Source</h1>
          {isAnalyzed && <StatusBadge label={isPublished ? "Source Published" : "Source Analyzed"} active={isPublished} />}
        </div>
        
        <div className="flex gap-2">
          {isAnalyzed && !isPublished && (
            <button onClick={() => onNext(sourceData, false)} className="text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all active:scale-95"><Save size={14} /> Save Draft</button>
          )}
          {isAnalyzed && (
            <button onClick={() => onNext(sourceData)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-indigo-700 transition-all active:scale-95">Go to Mapping →</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-8 gap-8">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Context</label>
            <select 
              disabled={isLocked} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs" 
              value={activeProject?.id || ""} 
              onChange={(e) => onSelectProject(eligibleProjects.find(p => p.id === e.target.value))}
            >
              <option value="" disabled>-- Select a Draft --</option>
              {eligibleProjects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>

          <div onClick={() => !isLocked && fileInputRef.current?.click()} className={`border-2 border-dashed border-slate-300 rounded-2xl flex-1 flex flex-col items-center justify-center transition-all ${isPublished ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50/30 cursor-pointer'}`}>
            <FileJson className="text-blue-600 mb-4" size={32} />
            <p className="font-bold text-slate-800 text-xs uppercase text-center px-4">
              {selectedFile ? (
                <span className="flex flex-col items-center gap-2">
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  {!isLocked && (
                    <button 
                      onClick={handleClearFile}
                      className="text-red-500 hover:text-red-700 text-[10px] font-black underline transition-colors"
                    >
                      × CLEAR FILE
                    </button>
                  )}
                </span>
              ) : (
                "Upload Internal Sample"
              )}
          </p>
            <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" accept=".csv,.json,.xml" />
          </div>

          <button onClick={handleAnalyze} disabled={isLocked || !selectedFile || isProcessing} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl disabled:bg-slate-300">{isProcessing ? 'AI Analyzing...' : 'Analyze Source Data'}</button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2"><Table size={14} /> Source Fields (Internal)</div>
          <div className="flex-1 overflow-auto p-6 space-y-8">
            {isAnalyzed ? (
              <>
                <EditableSection title="Header Fields" data={sourceData.header} onUpdate={(k, f, v) => handleUpdateField('header', k, f, v)} disabled={isLocked} />
                {sourceData.lines?.length > 0 && (
                  <EditableSection title="Line Item Structure" data={sourceData.lines[0]} onUpdate={(k, f, v) => handleUpdateField('lines', k, f, v)} isLines disabled={isLocked} />
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-40 font-bold uppercase tracking-widest text-[10px]"><FolderOpen size={48} /> Awaiting context</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditableSection = ({ title, data, onUpdate, isLines, disabled }) => (
  <div className="space-y-3 text-left">
    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <table className="w-full text-[11px] text-left border-collapse">
        <thead className="bg-slate-50 text-slate-400 font-bold text-[9px] uppercase">
          <tr><th className="px-4 py-2 border-b">Field Name</th><th className="px-4 py-2 border-b">Type</th><th className="px-4 py-2 border-b">Sample</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Object.keys(data || {}).map(key => (
            <tr key={key} className="group">
              <td className="px-4 py-2 bg-slate-50/50 font-bold text-slate-600 border-r">{isLines ? `Lines / ${key}` : key}</td>
              <td className="px-2 py-1">
                {/* 🛡️ Added fallback values to solve the React console error */}
                <select 
                  disabled={disabled}
                  className="w-full bg-transparent p-1 focus:ring-1 focus:ring-blue-100 outline-none rounded font-medium"
                  value={data[key]?.type || "String"} 
                  onChange={(e) => onUpdate(key, 'type', e.target.value)}
                >
                  {["String", "Integer", "Decimal", "Date", "Boolean"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </td>
              <td className="px-2 py-1">
                <input 
                  disabled={disabled}
                  type="text" 
                  className="w-full bg-transparent p-1 focus:ring-1 focus:ring-blue-100 outline-none rounded text-slate-500 italic"
                  value={data[key]?.sample || ""} 
                  onChange={(e) => onUpdate(key, 'sample', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Phase3View = ({ activeProject, onPublish, onSaveDraft, onGoToExport, onBack, onPrev }) => {
  const [isMapped, setIsMapped] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [mappings, setMappings] = useState(activeProject?.artifacts?.mappings || []); 
  const [transformationPrompt, setTransformationPrompt] = useState(activeProject?.artifacts?.prompt || "");
  const [activeMapping, setActiveMapping] = useState(null); 

  // 1. STATUS CHECK: Is this transformation already live?
  const isPublished = activeProject?.phases?.e === true;

  const sourceFields = activeProject?.artifacts?.sourceFields || { header: {}, lines: [] };
  const targetSchema = activeProject?.artifacts?.schema || { header: {}, lines: {} };

  // --- SURGICAL FIX: Handling Line Array vs Object ---
  const sourceLines = Array.isArray(sourceFields.lines) ? sourceFields.lines[0] : sourceFields.lines;
  const targetLines = Array.isArray(targetSchema.lines) ? targetSchema.lines[0] : targetSchema.lines;

  const availableSourceFields = [
    ...Object.keys(sourceFields.header || {}),
    ...Object.keys(sourceLines || {}).map(k => `Lines / ${k}`)
  ];

  const availableTargetFields = [
    ...Object.keys(targetSchema.header || {}),
    ...Object.keys(targetLines || {}).map(k => `Lines / ${k}`)
  ];

  const cleanName = (str) => str ? str.replace(/^(HEADER|LINE_ITEMS|Lines)(\.|\s\/\s|\/)/i, '').toLowerCase().trim() : "";

  useEffect(() => {
    if (activeProject?.artifacts?.mappings) {
      setMappings(activeProject.artifacts.mappings);
      setIsMapped(true);
    }
    if (activeProject?.artifacts?.prompt) {
      setTransformationPrompt(activeProject.artifacts.prompt);
    }
  }, [activeProject]);

  const handleEditField = (fieldName) => {
    const match = mappings.find(m => 
      cleanName(m.source) === cleanName(fieldName) || 
      cleanName(m.target) === cleanName(fieldName)
    );
    
    if (match) {
      // Find the raw technical names from your available lists
      const rawSource = availableSourceFields.find(f => cleanName(f) === cleanName(match.source)) || "Unmapped";
      const rawTarget = availableTargetFields.find(f => cleanName(f) === cleanName(match.target)) || "Unmapped";

      setActiveMapping({
        ...match,
        source: rawSource,
        target: rawTarget
      });
    } else {
      // Logic for fields that have no mapping yet
      const isTargetField = availableTargetFields.some(f => cleanName(f) === cleanName(fieldName));
      setActiveMapping({
        source: isTargetField ? "Unmapped" : fieldName,
        target: isTargetField ? fieldName : "Unmapped",
        rule: "Manual mapping required.",
        confidence: 0
      });
    }
  };

  const handleSuggest = async () => {
    if (isPublished) return; // Prevent logic trigger if locked
    setIsSuggesting(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            state: { phase: "mapping_suggestion" },
            source_schema: sourceFields,
            target_schema: targetSchema,
            user_instructions: transformationPrompt 
          }
        }),
      });
      const data = await response.json();
      const result = JSON.parse(data.response);
      setMappings(result.suggestions);
      setIsMapped(true);
    } catch (err) {
      console.error("AI Suggestion failed:", err);
    } finally {
      setIsSuggesting(false);
    }
  };

  // 🎯 SURGICAL FIX: Atomic Save to prevent mapping conflicts
  const handleSaveMapping = () => {
    if (!activeMapping) return;
    
    // 1. CLEAR BOTH SIDES: Remove any existing mapping that involves 
    // the Source field OR the Target field selected in the modal.
    const cleanList = mappings.filter(m => 
      cleanName(m.source) !== cleanName(activeMapping.source) && 
      cleanName(m.target) !== cleanName(activeMapping.target)
    );
    
    // 2. CREATE NEW LINK: Only add it if neither side is "Unmapped"
    let finalizedList = cleanList;
    if (activeMapping.source !== "Unmapped" && activeMapping.target !== "Unmapped") {
      finalizedList = [...cleanList, { 
        ...activeMapping, 
        confidence: 1.0 // Manual override is always 100% confident
      }];
    }
    
    // 3. FORCE RE-RENDER: Updates the main screen immediately
    setMappings([...finalizedList]);
    setActiveMapping(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-500 text-left relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <NavControls onBack={onBack} onPrev={onPrev} />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mr-4">Phase 3: AI Mapping</h1>
          
          {/* 2. DYNAMIC STATUS BADGE: Turns green when Published */}
          {isMapped && (
            <StatusBadge 
              label={isPublished ? "Transformation Published" : "Mapping Draft"} 
              active={isPublished} 
            />
          )}
        </div>
        
        <div className="flex gap-2">
          {/* 3. CONDITIONAL BUTTONS: Hide editing buttons if Published */}
          {!isPublished && (
            <>
              <button onClick={handleSuggest} disabled={isSuggesting} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg text-xs transition-all active:scale-95">
                {isSuggesting ? 'AI Suggesting...' : <><Sparkles size={16} /> {isMapped ? 'Re-Suggest Mappings' : 'Suggest Mappings'}</>}
              </button>
              {isMapped && (
                <button onClick={() => onSaveDraft(mappings, transformationPrompt)} className="text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all active:scale-95">
                  <Save size={14} /> Save Draft
                </button>
              )}
            </>
          )}
          
          {/* Always show the Primary Action */}
          {isMapped && (
            isPublished ? (
              <button onClick={onGoToExport} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 animate-in zoom-in-95">
                Go to Export &rarr;
              </button>
            ) : (
              <button onClick={() => onPublish(mappings, transformationPrompt)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95">
                Publish Transformation
              </button>
            )
          )}
        </div>
      </div>

      {/* 4. READ-ONLY RULES BOX: Disabled once Published */}
      <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex gap-3 items-start ${isPublished ? 'opacity-70 grayscale-[0.5]' : ''}`}>
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0"><MessageSquare size={20} /></div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Transformation Rules (Natural Language)</label>
            {!isPublished && transformationPrompt && (
              <button onClick={() => setTransformationPrompt("")} className="text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                <Trash2 size={10} /> Clear Rules
              </button>
            )}
          </div>
          <textarea 
            rows={2} 
            disabled={isPublished}
            className={`w-full text-sm outline-none resize-none placeholder:text-slate-300 font-medium text-slate-600 ${isPublished ? 'cursor-not-allowed' : ''}`}
            placeholder="e.g. Map names to uppercase, convert currency..." 
            value={transformationPrompt} 
            onChange={(e) => setTransformationPrompt(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-2 min-h-[550px]">
        <div className="p-8 border-r border-slate-100 bg-slate-50/30 space-y-3 text-left">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Source Fields</div>
          {availableSourceFields.map(field => {
            const match = mappings.find(m => cleanName(m.source) === cleanName(field));
            return <MappingField key={field} label={field} type="Source" active={isMapped && !!match} targetLabel={match ? `→ ${cleanName(match.target)}` : null} onEdit={() => handleEditField(field)} />;
          })}
        </div>
        <div className="p-8 space-y-3 text-left">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-right">Target Schema</div>
          {availableTargetFields.map(field => {
            const incomingMatch = mappings.find(m => cleanName(m.target) === cleanName(field));
            return <MappingField key={field} label={field} type="Target" isTarget active={isMapped && !!incomingMatch} targetLabel={incomingMatch ? `← ${incomingMatch.source}` : null} onEdit={() => handleEditField(field)} />;
          })}
        </div>
      </div>

      {activeMapping && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-lg"><Zap size={16} /></div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Revise Mapping Logic</h3>
              </div>
              <button onClick={() => setActiveMapping(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Field</p>
                  <select 
                    className="w-full font-mono text-xs font-bold text-indigo-600 bg-indigo-50 p-2 rounded-lg border border-indigo-100 outline-none"
                    value={activeMapping.source}
                    onChange={(e) => setActiveMapping({...activeMapping, source: e.target.value})}
                  >
                    <option value="Unmapped">-- Unmapped --</option>
                    {availableSourceFields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Field</p>
                  <select 
                    className="w-full font-mono text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 outline-none"
                    value={activeMapping.target}
                    onChange={(e) => setActiveMapping({...activeMapping, target: e.target.value})}
                  >
                    {/* 🎯 ADD THIS LINE: Allows unmapping from the target side */}
                    <option value="Unmapped">-- Unmapped --</option>
                    {availableTargetFields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
              </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transformation Reasoning</label>
                <textarea 
                  rows={3}
                  className="w-full p-4 bg-slate-900 text-blue-300 font-mono text-xs leading-relaxed italic rounded-2xl border border-slate-800 outline-none resize-none"
                  value={activeMapping.rule}
                  onChange={(e) => setActiveMapping({...activeMapping, rule: e.target.value})}
                  placeholder="Describe the transformation logic..."
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence Override: <span className="text-emerald-500">100%</span></span>
                <div className="flex gap-2">
                  <button onClick={() => setActiveMapping(null)} className="text-slate-400 px-4 py-2 text-xs font-bold hover:text-slate-600">Cancel</button>
                  <button onClick={handleSaveMapping} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Phase4View = ({ activeProject, onBack, onPrev }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(activeProject?.artifacts?.generatedCode || "");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const targetPlatform = activeProject?.target || "MuleSoft";

  // 🚀 MANUAL AI TRIGGER: Called only when clicking the new blue button
  const handleGenerateTransformation = async () => {
    if (!activeProject?.artifacts?.mappings) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            state: { 
              phase: "code_generation", 
              target_system: targetPlatform 
            },
            mappings: activeProject.artifacts.mappings,
            source_schema: activeProject.artifacts.sourceFields,
            target_schema: activeProject.artifacts.schema,
            user_instructions: activeProject.artifacts.prompt
          }
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.response);
      const newCode = result.generated_code;

      setGeneratedCode(newCode);

      // 🔥 This line saves the code to your global project memory
      if (activeProject?.artifacts) {
        activeProject.artifacts.generatedCode = newCode;
      }
    } catch (err) {
      console.error("Code Generation failed:", err);
      setGeneratedCode("// Error generating code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (content, fileName) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-500 text-left">
      <div className="flex justify-between items-center text-left">
        <div className="flex items-center">
          <NavControls onBack={onBack} onPrev={onPrev} />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mr-4">Phase 4: Export & Deploy</h1>
          <StatusBadge 
            label={generatedCode ? `${targetPlatform} Artifacts Ready` : "Awaiting Generation"} 
            active={!!generatedCode} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 text-left text-sm flex flex-col">
          {/* CODE PREVIEW BOX */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[550px]">
            <div className="p-4 border-b border-slate-800 bg-black/20 flex justify-between items-center text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Code size={14} /> {targetPlatform} Logic Preview
              </span>
              {generatedCode && (
                <button 
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(generatedCode);
                      alert("Copied to clipboard!");
                    } catch (err) {
                      console.error("Clipboard failed", err);
                      alert("Copy blocked by browser. Please select the text and press Ctrl+C (or Cmd+C) to copy.");
                    }
                  }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[10px] font-bold uppercase"
                >
                  <Copy size={14} /> Copy Snippet
                </button>
              )}
            </div>
            <div className="flex-1 p-8 overflow-auto text-left">
              {generatedCode ? (
                <pre className={`text-sm font-mono text-left leading-relaxed ${isGenerating ? 'text-slate-500 animate-pulse' : 'text-emerald-400'}`}>
                  {generatedCode}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <Sparkles size={32} className="opacity-20" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-40 text-center">Click below to generate logic</p>
                </div>
              )}
            </div>
          </div>

          {/* 🎯 NEW GENERATE BUTTON: Blue style matching "Go to Export" */}
          {!generatedCode && (
            <button 
              onClick={handleGenerateTransformation}
              disabled={isGenerating}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isGenerating ? (
                <>AI Writing Code...</>
              ) : (
                <>
                  <Zap size={20} className="fill-current" />
                  Generate {targetPlatform} Transformation
                </>
              )}
            </button>
          )}
        </div>

        {/* ACTION PANEL */}
        <div className="space-y-6 text-left">
          
          {/* 🎯 PRIMARY ACTION: THE LOGIC FILE (Moved to top & Updated) */}
          <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white space-y-6 text-left">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-white/20 rounded-lg"><Code size={20} /></div>
              <h3 className="font-black uppercase tracking-widest text-[10px] text-left">
                {targetPlatform} Logic File
              </h3>
            </div>
            <p className="text-xs font-medium opacity-90 leading-relaxed text-left">
              Download the transformation logic for your {targetPlatform} environment.
            </p>
            <button 
              disabled={!generatedCode || isGenerating || isDownloaded}
              onClick={() => {
                const extensionMap = { 'Boomi': 'xslt', 'MuleSoft': 'dwl', 'DextrHub': 'json' };
                const ext = extensionMap[targetPlatform] || 'txt';
                handleDownload(generatedCode, `${activeProject.name}_transform.${ext}`);
              }}
              className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${isDownloaded ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50 active:scale-95'}`}
            >
              {isDownloaded ? <><CheckCircle size={18} /> File Ready</> : <><Download size={18} /> Download {targetPlatform} Logic</>}
            </button>
          </div>

          {/* 📄 SECONDARY ARTIFACTS (Labels updated, Logic button removed) */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-left">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] text-left">
              Export {targetPlatform} Artifacts
            </h3>
            
            <ActionBtn 
              icon={<FileJson size={18} />} 
              label="Download Target Schema" 
              disabled={isGenerating}
              onClick={() => handleDownload(JSON.stringify(activeProject.artifacts.schema, null, 2), `target_schema.json`)}
            />
            
            <ActionBtn 
              icon={<FileSpreadsheet size={18} />} 
              label="Download Source Schema" 
              disabled={isGenerating}
              onClick={() => {
                const rawData = activeProject.artifacts.sourceFields;
                const typedSourceSchema = {
                  header: Object.keys(rawData.header || {}).reduce((acc, key) => {
                    acc[key] = rawData.header[key]?.type || "String";
                    return acc;
                  }, {}),
                  lines: [ 
                    Object.keys(rawData.lines?.[0] || {}).reduce((acc, key) => {
                      acc[key] = rawData.lines[0][key]?.type || "String";
                      return acc;
                    }, {})
                  ]
                };
                handleDownload(JSON.stringify(typedSourceSchema, null, 2), `source_schema.json`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MappingField = ({ label, type, isTarget, active, targetLabel, onEdit, confidence }) => (
  <div className={`flex flex-col gap-2 p-4 rounded-xl border transition-all ${active ? 'border-indigo-200 bg-white shadow-sm' : 'border-slate-100 bg-white/50'}`}>
    <div className={`flex items-center gap-4 ${isTarget ? 'flex-row-reverse w-full' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? (isTarget ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white') : 'bg-slate-100 text-slate-400'}`}>
        {active ? <CheckCircle size={18} /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>

      <div className={`flex-1 min-0 ${isTarget ? 'text-right' : 'text-left'}`}>
        <p className={`text-sm font-bold truncate ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</p>
        {targetLabel && (
          <div className="mt-1 flex flex-col gap-1">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-[9px] font-black text-indigo-600 uppercase border border-indigo-100 max-w-full overflow-hidden">
              <span className="truncate">{targetLabel}</span>
            </div>
            {/* 🎯 AI CONFIDENCE BADGE: Shows the dynamic auditor score */}
            {confidence > 0 && (
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">
                AI Confidence: {(confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* 🎯 SURGICAL FIX: FX Button now visible on both Source and Target sides */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onEdit(label); 
        }} 
        className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all shadow-sm ${
          active 
          ? (isTarget ? 'border-emerald-100 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'border-indigo-100 text-indigo-400 hover:bg-indigo-600 hover:text-white')
          : 'border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'
        }`}
      >
        fx
      </button>
    </div>
    <div className={`flex ${isTarget ? 'justify-end' : 'justify-start'}`}>
      <p className="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-widest">{type}</p>
    </div>
  </div>
);

const ExportBtn = ({ icon, label }) => (<button className="flex items-center gap-3 w-full p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all font-bold text-slate-700 text-left">{icon} {label}</button>);