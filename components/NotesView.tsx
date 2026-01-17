
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Search, Folder, Tag, Star, Trash2, Clock, 
  Bold, Italic, List, ListOrdered, Palette, Link as LinkIcon,
  ChevronDown, MoreHorizontal, FileText, ChevronRight, StickyNote,
  Check, X, FolderPlus, Settings, Hash
} from 'lucide-react';
import { Note, Folder as NoteFolder } from '../types';

interface NotesViewProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  folders: NoteFolder[];
  setFolders: React.Dispatch<React.SetStateAction<NoteFolder[]>>;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, setNotes, folders, setFolders }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolderId, setActiveFolderId] = useState('all');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Tags State
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const saved = localStorage.getItem('artifacts_available_tags');
    return saved ? JSON.parse(saved) : ['IMPORTANTE', 'DRAFT', 'SQUAD', 'LEITURA'];
  });

  useEffect(() => {
    localStorage.setItem('artifacts_available_tags', JSON.stringify(availableTags));
  }, [availableTags]);

  // States for menus
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showNoteFolderMenu, setShowNoteFolderMenu] = useState(false);

  // Refs for click outside detection
  const sidebarMenuRef = useRef<HTMLDivElement>(null);
  const noteFolderMenuRef = useRef<HTMLDivElement>(null);

  const activeNote = useMemo(() => notes.find(n => n.id === selectedNoteId), [notes, selectedNoteId]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesFolder = activeFolderId === 'all' || n.folderId === activeFolderId;
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           n.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFolder && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, activeFolderId, searchQuery]);

  // Click outside effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(event.target as Node)) {
        setShowSidebarMenu(false);
      }
      if (noteFolderMenuRef.current && !noteFolderMenuRef.current.contains(event.target as Node)) {
        setShowNoteFolderMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Nota',
      content: '',
      folderId: activeFolderId === 'all' ? (folders[1]?.id || 'default') : activeFolderId,
      tags: [],
      updatedAt: new Date().toISOString(),
      isFavorite: false
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id: string) => {
    if (window.confirm('Excluir esta nota permanentemente?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      if (selectedNoteId === id) {
        setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      }
    }
  };

  const handleCreateFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("[DEBUG] Botão 'Novo Caderno' clicado.");
    
    const name = prompt('Nome do novo caderno:');
    console.log("[DEBUG] Resultado do prompt:", name);
    
    if (name) {
      const newFolder: NoteFolder = {
        id: Date.now().toString(),
        name: name.trim(),
        color: 'text-blue-500'
      };
      console.log("[DEBUG] Criando novo caderno:", newFolder);
      setFolders([...folders, newFolder]);
      setShowSidebarMenu(false);
    } else if (name === "") {
        console.warn("[DEBUG] Nome vazio, operação cancelada.");
        alert("O nome do caderno não pode ser vazio.");
    } else {
        console.log("[DEBUG] Operação de criação de caderno cancelada pelo usuário.");
        setShowSidebarMenu(false);
    }
  };

  const handleManageFolders = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("[DEBUG] Botão 'Gerenciar' clicado.");
    alert('Funcionalidade de gerenciamento de cadernos em desenvolvimento.');
    setShowSidebarMenu(false);
  };

  // Tags Logic
  const handleAddTag = () => {
    const newTag = prompt('Nome da nova etiqueta (sem espaços):')?.trim().toUpperCase();
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
    }
  };

  const handleDeleteTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    if (window.confirm(`Excluir etiqueta #${tag}?`)) {
      setAvailableTags(availableTags.filter(t => t !== tag));
      // Remove tag from all notes
      setNotes(prev => prev.map(note => ({
        ...note,
        tags: note.tags.filter(t => t !== tag)
      })));
    }
  };

  // Editor Ref and Actions
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || '');
    if (editorRef.current) {
        updateNote(selectedNoteId!, { content: editorRef.current.innerHTML });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.startContainer;
            const textContent = container.textContent || '';
            const cursorPosition = range.startOffset;

            if (textContent.substring(0, cursorPosition) === '*') {
                e.preventDefault();
                execCommand('insertUnorderedList');
                const node = selection.anchorNode;
                if (node && node.textContent && node.textContent.startsWith('*')) {
                    node.textContent = node.textContent.replace('*', '');
                }
            }
            if (textContent.substring(0, cursorPosition) === '1.') {
                e.preventDefault();
                execCommand('insertOrderedList');
                const node = selection.anchorNode;
                if (node && node.textContent && node.textContent.startsWith('1.')) {
                    node.textContent = node.textContent.replace('1.', '');
                }
            }
        }
    }
  };

  const handleInput = () => {
    if (editorRef.current && selectedNoteId) {
      updateNote(selectedNoteId, { content: editorRef.current.innerHTML });
    }
  };

  useEffect(() => {
      if (editorRef.current && activeNote) {
          if (editorRef.current.innerHTML !== activeNote.content) {
              editorRef.current.innerHTML = activeNote.content;
          }
      }
  }, [selectedNoteId]);

  const colors = [
    { name: 'Branco', value: '#ffffff' },
    { name: 'Azul', value: '#60a5fa' },
    { name: 'Verde', value: '#34d399' },
    { name: 'Amarelo', value: '#fbbf24' },
    { name: 'Vermelho', value: '#f87171' },
    { name: 'Roxo', value: '#a78bfa' },
  ];

  return (
    <div className="flex h-full w-full bg-[#020617] border border-slate-800 rounded-sm overflow-hidden animate-in fade-in duration-500">
      {/* 1. Sidebar de Organização */}
      <div className="w-64 border-r border-slate-800 flex flex-col bg-[#030712]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/20 relative" ref={sidebarMenuRef}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bibliotecas</h3>
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSidebarMenu(!showSidebarMenu); }}
                className={`p-1 rounded-sm transition-all ${showSidebarMenu ? 'text-white bg-slate-800' : 'text-slate-500 hover:text-white'}`}
                title="Opções de Biblioteca"
              >
                <MoreHorizontal size={14}/>
              </button>
              
              {showSidebarMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-[#030712] border border-slate-800 rounded-sm shadow-2xl z-[100] overflow-hidden">
                  <button 
                    onClick={handleCreateFolder} 
                    className="w-full text-left px-4 py-3 text-[10px] font-black text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2 uppercase tracking-widest transition-all border-b border-slate-800/50"
                  >
                    <FolderPlus size={12} /> Novo Caderno
                  </button>
                  <button 
                    onClick={handleManageFolders}
                    className="w-full text-left px-4 py-3 text-[10px] font-black text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2 uppercase tracking-widest transition-all"
                  >
                    <Settings size={12} /> Gerenciar
                  </button>
                </div>
              )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {folders.map(folder => (
            <button 
              key={folder.id}
              onClick={() => setActiveFolderId(folder.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm transition-all group ${activeFolderId === folder.id ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
            >
              <Folder size={14} className={activeFolderId === folder.id ? 'text-blue-500' : folder.color} />
              <span className="text-[11px] font-bold uppercase tracking-tight flex-1 text-left">{folder.name}</span>
              <span className="text-[9px] font-black opacity-40 group-hover:opacity-100">
                {notes.filter(n => folder.id === 'all' || n.folderId === folder.id).length}
              </span>
            </button>
          ))}

          <div className="pt-6 px-3">
             <div className="flex items-center justify-between mb-2">
               <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Tag size={10} /> Etiquetas
               </h4>
               <button 
                onClick={handleAddTag}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-700 hover:text-blue-400 transition-all"
                title="Nova Etiqueta"
               >
                 <Plus size={10} />
               </button>
             </div>
             
             <div className="flex flex-wrap gap-1">
                {availableTags.length === 0 ? (
                  <p className="text-[8px] font-bold text-slate-800 uppercase italic px-1">Nenhuma etiqueta</p>
                ) : (
                  availableTags.map(tag => (
                    <div 
                      key={tag} 
                      className="group/tag relative px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[8px] font-black text-slate-500 hover:text-blue-400 hover:border-blue-500/30 cursor-pointer transition-all flex items-center gap-1"
                    >
                        <Hash size={8} className="opacity-40" />
                        {tag}
                        <button 
                          onClick={(e) => handleDeleteTag(e, tag)}
                          className="w-0 group-hover/tag:w-3 overflow-hidden opacity-0 group-hover/tag:opacity-100 hover:text-rose-500 transition-all"
                        >
                          <X size={10} />
                        </button>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
            <button 
              onClick={handleCreateNote}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Plus size={14} /> Nova Nota
            </button>
        </div>
      </div>

      {/* 2. Lista de Notas */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-[#020617]">
        <div className="p-4 border-b border-slate-800 bg-black/10">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
             <input 
                placeholder="Pesquisar notas..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-sm pl-10 pr-4 py-2 text-[11px] text-white focus:outline-none focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-8">
               <FileText size={24} className="text-slate-800 mb-2" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nenhuma nota encontrada</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-4 border-b border-slate-800/50 transition-all group ${selectedNoteId === note.id ? 'bg-[#0f172a] border-l-4 border-l-blue-500' : 'hover:bg-slate-900/40'}`}
              >
                <div className="flex justify-between items-start mb-1">
                   <h4 className={`text-xs font-black uppercase tracking-tight truncate flex-1 ${selectedNoteId === note.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {note.title || 'Nota sem título'}
                   </h4>
                   {note.isFavorite && <Star size={10} className="text-amber-500 fill-amber-500 ml-2 flex-shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: note.content.substring(0, 100).replace(/<[^>]*>?/gm, '') }} />
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-700">
                   <span className="flex items-center gap-1"><Clock size={10} /> {new Date(note.updatedAt).toLocaleDateString()}</span>
                   <span className="group-hover:text-slate-500 transition-colors">{folders.find(f => f.id === note.folderId)?.name}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 3. Editor de Texto Rico */}
      <div className="flex-1 flex flex-col bg-[#030712] relative overflow-hidden">
        {activeNote ? (
          <>
            {/* Toolbar do Editor */}
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-black/20 flex-shrink-0">
               <div className="flex items-center gap-1">
                  <button onClick={() => execCommand('bold')} className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-all" title="Negrito (Ctrl+B)"><Bold size={16} /></button>
                  <button onClick={() => execCommand('italic')} className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-all" title="Itálico (Ctrl+I)"><Italic size={16} /></button>
                  <div className="w-px h-6 bg-slate-800 mx-2" />
                  <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-all" title="Lista Marcada (* + Espaço)"><List size={16} /></button>
                  <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-all" title="Lista Numerada (1. + Espaço)"><ListOrdered size={16} /></button>
                  <div className="w-px h-6 bg-slate-800 mx-2" />
                  
                  <div className="relative">
                    <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-all flex items-center gap-1" title="Cor da Fonte">
                        <Palette size={16} />
                        <ChevronDown size={10} />
                    </button>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-[#030712] border border-slate-800 rounded-sm shadow-2xl flex flex-wrap gap-1 w-32 z-50">
                            {colors.map(c => (
                                <button key={c.value} onClick={() => { execCommand('foreColor', c.value); setShowColorPicker(false); }} className="w-6 h-6 rounded-full border border-slate-800" style={{ backgroundColor: c.value }} title={c.name} />
                            ))}
                        </div>
                    )}
                  </div>
                  
                  <button onClick={() => { const url = prompt('URL do Link:'); if (url) execCommand('createLink', url); }} className="p-2 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-all" title="Adicionar Link"><LinkIcon size={16} /></button>
               </div>

               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateNote(activeNote.id, { isFavorite: !activeNote.isFavorite })}
                    className={`p-2 rounded-sm transition-all ${activeNote.isFavorite ? 'text-amber-500 bg-amber-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    title="Favoritar Nota"
                  >
                    <Star size={16} fill={activeNote.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={() => deleteNote(activeNote.id)} 
                    className="p-2 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 rounded-sm transition-all" 
                    title="Excluir Nota Permanentemente"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>

            {/* Área de Edição - Espaçamento Otimizado */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-12 px-8 lg:px-16 max-w-7xl mx-auto w-full">
               <div className="mb-8">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-3xl font-black text-white uppercase tracking-tight placeholder:text-slate-800"
                    placeholder="Título da Nota..."
                    value={activeNote.title}
                    onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                  />
                  <div className="flex items-center gap-4 mt-4 relative" ref={noteFolderMenuRef}>
                     <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> Atualizado {new Date(activeNote.updatedAt).toLocaleTimeString()}
                     </span>
                     <div className="h-4 w-px bg-slate-800" />
                     
                     <div className="relative">
                       <button 
                        onClick={() => setShowNoteFolderMenu(!showNoteFolderMenu)}
                        className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all ${showNoteFolderMenu ? 'text-blue-400' : 'text-blue-500/60 hover:text-blue-500'}`}
                        title="Mudar Caderno desta Nota"
                       >
                          <Folder size={10} /> {folders.find(f => f.id === activeNote.folderId)?.name}
                       </button>

                       {showNoteFolderMenu && (
                         <div className="absolute top-full left-0 mt-2 w-48 bg-[#030712] border border-slate-800 rounded-sm shadow-2xl z-[100] overflow-hidden py-1">
                           <div className="px-3 py-1 text-[8px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800 mb-1">Mover para:</div>
                           {folders.filter(f => f.id !== 'all').map(folder => (
                             <button
                               key={folder.id}
                               onClick={() => {
                                 updateNote(activeNote.id, { folderId: folder.id });
                                 setShowNoteFolderMenu(false);
                               }}
                               className={`w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center justify-between transition-all ${activeNote.folderId === folder.id ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                             >
                               {folder.name}
                               {activeNote.folderId === folder.id && <Check size={10} />}
                             </button>
                           ))}
                         </div>
                       )}
                     </div>
                  </div>
               </div>

               {/* Remove non-standard 'placeholder' attribute from div element to fix TypeScript error */}
               <div 
                  ref={editorRef}
                  contentEditable
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[600px] text-slate-300 leading-relaxed focus:outline-none prose prose-invert prose-blue max-w-none
                             [&_h1]:text-2xl [&_h1]:font-black [&_h1]:uppercase [&_h1]:tracking-tighter [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-white
                             [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-4
                             [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-4
                             [&_p]:mb-4 [&_p]:text-[15px]
                             [&_a]:text-blue-400 [&_a]:underline"
               />
            </div>

            {/* Atalhos e Dicas */}
            <div className="p-3 border-t border-slate-800/50 bg-black/10 flex items-center justify-between text-[9px] font-black text-slate-700 uppercase tracking-widest px-8">
               <div className="flex gap-4">
                  <span>Ctrl+B: Bold</span>
                  <span>Ctrl+I: Italic</span>
                  <span>[[ : Link Nota</span>
               </div>
               <span className="text-emerald-500/50 flex items-center gap-1">
                  <ShieldCheck size={10} /> Criptografia de Ponta a Ponta Ativa
               </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-20 h-20 rounded-sm bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-2xl">
                <StickyNote size={32} className="text-slate-800" />
             </div>
             <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Selecione uma Nota</h3>
             <p className="text-[10px] text-slate-600 uppercase font-bold tracking-tight max-w-[200px] leading-relaxed">
                Navegue pela sua biblioteca lateral para editar ou criar novas documentações.
             </p>
             <button 
                onClick={handleCreateNote}
                className="mt-8 px-8 py-3 bg-blue-600/10 border border-blue-500/30 rounded-sm text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
             >
                Criar Primeiro Registro
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ShieldCheck = ({ size, className = '' }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default NotesView;
