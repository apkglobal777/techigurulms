import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, PlusCircle, Video, 
  Settings, LogOut, Trash2, Edit2, Save, DollarSign, 
  Users, Clock, BarChart3, Search, XCircle, 
  Mail, Image as ImageIcon, Loader, ChevronRight, 
  Layers, Menu, X, Bell, ExternalLink, ChevronDown, 
  ChevronUp, AlignLeft, Award, Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse } from '../context/CourseContext'; 
import { useAuth } from '../context/AuthContext';     
import api from '../api/axios'; 
import { Link, useNavigate } from 'react-router-dom';

// --- TYPES ---
interface VideoItem { 
    id: number | string; 
    title: string; 
    videoKey: string; 
    duration: string; 
    isFree: boolean;
    description: string;
}

interface TopicItem { id: number | string; title: string; videos: VideoItem[]; }
interface CourseData { id?: string; title: string; description: string; price: string; category: string; status: 'Active' | 'Inactive' | 'Draft'; thumbnail: string | null; topics: TopicItem[]; }

interface CertificateData {
    id?: string;
    title: string;
    description: string;
    genre: string;
    link: string;
    status: 'Active' | 'Inactive' | 'Draft';
    thumbnail: string | null;
}

// --- HELPER: THUMBNAIL URL ---
const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150?text=No+Image';
    if (url.startsWith('/uploads') || url.startsWith('\\uploads')) {
        return `http://13.127.138.86:5000${url.replace(/\\/g, '/')}`;
    }
    return url;
};

// --- SUB-COMPONENTS ---

// 1. VIDEO ROW COMPONENT 
const VideoRow: React.FC<{ 
    video: VideoItem; 
    topicId: number | string; 
    updateVideo: (tId: number | string, vId: number | string, field: keyof VideoItem, val: any) => void;
    deleteVideo: (tId: number | string, vId: number | string) => void;
}> = ({ video, topicId, updateVideo, deleteVideo }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group rounded-2xl border border-slate-100 bg-white hover:border-violet-200 transition-all shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 sm:p-4 bg-white z-10 relative">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg hidden md:block">
                    <Video size={18} />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 w-full items-center">
                    <div className="md:col-span-5">
                        <input 
                            type="text" 
                            placeholder="Lesson Title" 
                            className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-violet-500 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400" 
                            value={video.title} 
                            onChange={(e) => updateVideo(topicId, video.id, 'title', e.target.value)} 
                        />
                    </div>
                    
                    <div className="md:col-span-4 relative">
                        <input 
                            type="text" 
                            placeholder="Video Key / URL" 
                            className="w-full pl-2 p-2 bg-transparent border-b border-slate-200 focus:border-violet-500 outline-none text-sm text-slate-600 font-mono placeholder:text-slate-300" 
                            value={video.videoKey} 
                            onChange={(e) => updateVideo(topicId, video.id, 'videoKey', e.target.value)} 
                        />
                    </div>

                    <div className="md:col-span-3 flex items-center gap-2 justify-between md:justify-end">
                        <input 
                            type="text" 
                            placeholder="00:00" 
                            className="w-20 p-2 bg-transparent border-b border-slate-200 focus:border-violet-500 outline-none text-sm text-slate-600 text-center placeholder:text-slate-300" 
                            value={video.duration} 
                            onChange={(e) => updateVideo(topicId, video.id, 'duration', e.target.value)} 
                        />
                        
                        <div className="flex items-center gap-1 border-l border-slate-100 pl-2 ml-1">
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)} 
                                className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'}`}
                                title="Add Description/Notes"
                            >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            <button 
                                onClick={() => deleteVideo(topicId, video.id)} 
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Lesson"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50/50 border-t border-slate-100"
                    >
                        <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <AlignLeft size={14} /> Lesson Summary / Notes
                            </div>
                            <textarea 
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none text-sm text-slate-600 resize-y min-h-[100px]"
                                placeholder="Describe what the students will learn in this video lesson..."
                                value={video.description || ''}
                                onChange={(e) => updateVideo(topicId, video.id, 'description', e.target.value)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 2. SIDEBAR COMPONENT
const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }: any) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'active_courses', label: 'My Courses', icon: BookOpen },
    { id: 'add_course', label: 'Create Course', icon: PlusCircle },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'profile', label: 'Settings', icon: Settings }, 
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-violet-900/50 group-hover:scale-105 transition-transform">T</div>
          <span className="text-xl font-bold text-white tracking-tight">TutorPanel</span>
        </Link>
        <button onClick={onClose} className="lg:hidden ml-auto text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); onClose(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
              activeTab === item.id 
                ? 'bg-violet-600 text-white shadow-xl shadow-violet-900/20' 
                : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
            }`}
          >
            <item.icon size={20} className={`relative z-10 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span className="font-medium text-sm relative z-10">{item.label}</span>
            {activeTab === item.id && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800/50 bg-[#0B1120]">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-72 bg-[#0F172A] min-h-screen fixed left-0 top-0 z-50 border-r border-slate-800">
        {sidebarContent}
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-72 bg-[#0F172A] z-50 lg:hidden shadow-2xl">
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// 3. COURSE BUILDER
const CourseBuilder: React.FC<{ initialData?: any; onSave: (data: CourseData) => void; onCancel: () => void; isSaving: boolean; }> = ({ initialData, onSave, onCancel, isSaving }) => {
  const [uploading, setUploading] = useState(false);
  const [courseData, setCourseData] = useState<CourseData>(() => {
     if (initialData) {
       return {
         id: initialData.id,
         title: initialData.title || '',
         description: initialData.description || '',
         price: initialData.price?.toString() || '',
         category: initialData.category || 'Development',
         status: initialData.status || 'Draft',
         thumbnail: initialData.thumbnail || null,
         topics: initialData.topics || [] 
       };
     }
     return { title: '', description: '', price: '', category: 'Development', status: 'Draft', thumbnail: null, topics: [{ id: Date.now(), title: 'Introduction', videos: [] }] };
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      setUploading(true);
      try {
        const { data } = await api.post('/courses/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setCourseData(prev => ({ ...prev, thumbnail: data.url }));
      } catch (error) { alert("Image upload failed"); } finally { setUploading(false); }
    }
  };

  const handleAddTopic = () => setCourseData(prev => ({ ...prev, topics: [...prev.topics, { id: Date.now(), title: '', videos: [] }] }));
  const handleAddVideo = (tId: number | string) => setCourseData(prev => ({ ...prev, topics: prev.topics.map(t => t.id === tId ? { ...t, videos: [...t.videos, { id: Date.now(), title: '', videoKey: '', duration: '', isFree: false, description: '' }] } : t) }));
  const updateTopic = (id: number | string, val: string) => setCourseData(prev => ({ ...prev, topics: prev.topics.map(t => t.id === id ? { ...t, title: val } : t) }));
  const updateVideo = (tId: number | string, vId: number | string, field: keyof VideoItem, val: any) => setCourseData(prev => ({ ...prev, topics: prev.topics.map(t => t.id === tId ? { ...t, videos: t.videos.map(v => v.id === vId ? { ...v, [field]: val } : v) } : t) }));
  const deleteTopic = (id: number | string) => setCourseData(prev => ({ ...prev, topics: prev.topics.filter(t => t.id !== id) }));
  const deleteVideo = (tId: number | string, vId: number | string) => setCourseData(prev => ({ ...prev, topics: prev.topics.map(t => t.id === tId ? { ...t, videos: t.videos.filter(v => v.id !== vId) } : t) }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="sticky top-20 lg:top-4 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/20 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {initialData ? <Edit2 className="text-violet-600" size={20}/> : <PlusCircle className="text-violet-600" size={20}/>}
            {initialData ? 'Edit Course' : 'Create Course'}
          </h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={onCancel} className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm">Cancel</button>
          <button onClick={() => onSave(courseData)} disabled={isSaving || uploading} className="flex-1 sm:flex-none px-6 py-2.5 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 hover:shadow-violet-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm">
            {isSaving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-50">
                    <Settings size={18} className="text-violet-500" /> Basic Details
                </h3>
                
                <div className="group relative w-full aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-violet-400 overflow-hidden transition-all cursor-pointer">
                    {uploading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                            <Loader className="animate-spin text-violet-600 mb-2"/>
                            <span className="text-xs font-semibold text-violet-600">Uploading...</span>
                        </div>
                    ) : courseData.thumbnail ? (
                        <>
                            <img src={getImageUrl(courseData.thumbnail)} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Change</span>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-violet-500">
                            <ImageIcon size={32} className="mb-2 opacity-50"/>
                            <span className="text-xs font-medium">Upload Thumbnail</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
                        <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-slate-700 placeholder:font-normal" placeholder="Course Title" value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                        <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all h-28 resize-none text-sm" value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price ($)</label>
                            <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-500 outline-none" value={courseData.price} onChange={(e) => setCourseData({...courseData, price: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-500 outline-none cursor-pointer" value={courseData.status} onChange={(e) => setCourseData({...courseData, status: e.target.value as any})}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-500 outline-none cursor-pointer" value={courseData.category} onChange={(e) => setCourseData({...courseData, category: e.target.value})}>
                            {['Development', 'Business', 'Design', 'Marketing', 'IT & Software'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen size={20} className="text-violet-600"/> Curriculum
                </h3>
                <button onClick={handleAddTopic} className="flex items-center gap-2 text-violet-700 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-violet-100">
                    <PlusCircle size={16} /> <span className="hidden sm:inline">Add Section</span>
                </button>
            </div>

            <div className="space-y-6">
                {courseData.topics.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                        <Layers size={48} className="mb-4 opacity-20"/>
                        <p>No content yet. Add a section to start.</p>
                    </div>
                )}

                <AnimatePresence>
                {courseData.topics.map((topic, tIndex) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={topic.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-slate-50/50 p-4 flex items-center gap-4 border-b border-slate-100">
                        <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">{tIndex + 1}</div>
                        <input type="text" placeholder="Section Title" className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder:text-slate-400 text-lg" value={topic.title} onChange={(e) => updateTopic(topic.id, e.target.value)} />
                        <button onClick={() => deleteTopic(topic.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>

                    <div className="p-3 sm:p-5 space-y-3">
                        {topic.videos.map((video) => (
                           <VideoRow 
                               key={video.id} 
                               video={video} 
                               topicId={topic.id} 
                               updateVideo={updateVideo} 
                               deleteVideo={deleteVideo} 
                           />
                        ))}
                        <button onClick={() => handleAddVideo(topic.id)} className="w-full py-3 mt-2 border border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2 text-sm group">
                            <PlusCircle size={16} className="group-hover:scale-110 transition-transform" /> Add Lesson
                        </button>
                    </div>
                </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

// 4. COURSE LIST
const CourseList: React.FC<any> = ({ courses, onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredCourses = courses.filter((course: any) => course.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm">
        <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <BookOpen className="text-violet-600" size={28}/> Course Library
            </h2>
            <p className="text-slate-500 text-sm mt-1">Manage your active and inactive content.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-72 group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
             <input 
                type="text" 
                placeholder="Search by title..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 text-sm transition-all shadow-sm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20"><Loader className="animate-spin text-violet-600 mb-4" size={40}/><p className="text-slate-400 font-medium">Loading your content...</p></div>
      ) : (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                    {['Course Name', 'Price', 'Students', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredCourses.length > 0 ? filteredCourses.map((course: any) => (
                    <tr key={course._id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm relative">
                                <img src={getImageUrl(course.thumbnail?.url)} alt="Thumbnail" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <span className="block font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors line-clamp-1">{course.title}</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">{course.category || 'General'}</span>
                            </div>
                        </div>
                        </td>
                        <td className="p-5 text-slate-700 font-bold text-sm font-mono">${course.price}</td>
                        <td className="p-5 text-slate-600 text-sm"><div className="flex items-center gap-1.5"><Users size={14} className="text-slate-400"/> {course.studentsEnrolled || 0}</div></td>
                        <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            course.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            course.status === 'Inactive' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'Active' ? 'bg-emerald-500' : course.status === 'Inactive' ? 'bg-slate-400' : 'bg-amber-500'}`}></span>
                            {course.status}
                        </span>
                        </td>
                        <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(course)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all" title="Edit"><Edit2 size={18} /></button>
                            <button onClick={() => onDelete(course._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                        </div>
                        </td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan={5} className="p-20 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center"><Search size={32} className="opacity-20"/></div>
                                <p>No courses found matching "{searchTerm}".</p>
                            </div>
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
      )}
    </div>
  );
};

// 5. CERTIFICATE LIST COMPONENT
const CertificateList: React.FC<any> = ({ certificates, onEdit, onDelete, onCreateClick, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredCertificates = certificates.filter((cert: any) => cert.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm">
          <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                  <Award className="text-violet-600" size={28}/> External Certificates
              </h2>
              <p className="text-slate-500 text-sm mt-1">Manage links to your external certification courses.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64 group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Search certificates..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 text-sm transition-all shadow-sm" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <button onClick={onCreateClick} className="px-5 py-3 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm shrink-0">
                <PlusCircle size={18}/> Add Certificate
             </button>
          </div>
        </div>
  
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20"><Loader className="animate-spin text-violet-600 mb-4" size={40}/><p className="text-slate-400 font-medium">Loading certificates...</p></div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                    {['Certificate Info', 'External Link', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredCertificates.length > 0 ? filteredCertificates.map((cert: any) => (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm relative">
                                <img src={getImageUrl(cert.thumbnail)} alt="Thumbnail" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <span className="block font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors line-clamp-1">{cert.title}</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">{cert.genre}</span>
                            </div>
                        </div>
                        </td>
                        <td className="p-5">
                            <a href={cert.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-violet-300 hover:text-violet-700 rounded-lg text-xs font-bold text-slate-600 transition-colors">
                                <LinkIcon size={14} /> View Course <ExternalLink size={12} className="opacity-50"/>
                            </a>
                        </td>
                        <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            cert.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            cert.status === 'Inactive' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cert.status === 'Active' ? 'bg-emerald-500' : cert.status === 'Inactive' ? 'bg-slate-400' : 'bg-amber-500'}`}></span>
                            {cert.status}
                        </span>
                        </td>
                        <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(cert)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all" title="Edit"><Edit2 size={18} /></button>
                            <button onClick={() => onDelete(cert.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                        </div>
                        </td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan={4} className="p-20 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center"><Award size={32} className="opacity-20"/></div>
                                <p>No certificates found. Add your first external certificate!</p>
                            </div>
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    );
};

// 6. CERTIFICATE BUILDER COMPONENT
const CertificateBuilder: React.FC<{ initialData?: any; onSave: (data: CertificateData) => void; onCancel: () => void; isSaving: boolean; }> = ({ initialData, onSave, onCancel, isSaving }) => {
    const [uploading, setUploading] = useState(false);
    const [certData, setCertData] = useState<CertificateData>(() => {
       if (initialData) {
         return {
           id: initialData.id || initialData._id, // Support MongoDB _id
           title: initialData.title || '',
           description: initialData.description || '',
           genre: initialData.genre || 'Technology',
           link: initialData.link || '',
           status: initialData.status || 'Draft',
           thumbnail: initialData.thumbnail || null,
         };
       }
       return { title: '', description: '', genre: 'Technology', link: '', status: 'Draft', thumbnail: null };
    });
  
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        const formData = new FormData();
        formData.append('image', e.target.files[0]);
        setUploading(true);
        try {
          // --- CONNECTED TO BACKEND UPLOAD ROUTE ---
          const { data } = await api.post('/certificates/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          setCertData(prev => ({ ...prev, thumbnail: data.url }));
        } catch (error) { alert("Image upload failed"); } finally { setUploading(false); }
      }
    };
  
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <div className="sticky top-20 lg:top-4 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/20 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {initialData ? <Edit2 className="text-violet-600" size={20}/> : <PlusCircle className="text-violet-600" size={20}/>}
              {initialData ? 'Edit Certificate' : 'Add External Certificate'}
            </h2>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onCancel} className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm">Cancel</button>
            <button onClick={() => onSave(certData)} disabled={isSaving || uploading} className="flex-1 sm:flex-none px-6 py-2.5 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 hover:shadow-violet-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm">
              {isSaving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Save
            </button>
          </div>
        </div>
  
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-50 text-lg">
                <Award size={22} className="text-violet-500" /> Certificate Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Thumbnail</label>
                    <div className="group relative w-full aspect-[4/3] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-violet-400 overflow-hidden transition-all cursor-pointer">
                        {uploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                                <Loader className="animate-spin text-violet-600 mb-2"/>
                                <span className="text-xs font-semibold text-violet-600">Uploading...</span>
                            </div>
                        ) : certData.thumbnail ? (
                            <>
                                <img src={getImageUrl(certData.thumbnail)} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Change</span>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-violet-500">
                                <ImageIcon size={32} className="mb-2 opacity-50"/>
                                <span className="text-xs font-medium">Upload Image</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>

                <div className="md:col-span-8 space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title / Certification Name</label>
                        <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-slate-700 placeholder:font-normal" placeholder="e.g. AWS Certified Solutions Architect" value={certData.title} onChange={(e) => setCertData({...certData, title: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">External Link URL</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="url" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-slate-700 placeholder:font-normal" placeholder="https://..." value={certData.link} onChange={(e) => setCertData({...certData, link: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Genre / Category</label>
                            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-slate-700 placeholder:font-normal" placeholder="e.g. Cloud Computing" value={certData.genre} onChange={(e) => setCertData({...certData, genre: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-500 outline-none cursor-pointer text-slate-700 font-medium" value={certData.status} onChange={(e) => setCertData({...certData, status: e.target.value as any})}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                        <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all h-28 resize-none text-sm text-slate-700" placeholder="Briefly describe what this certificate covers..." value={certData.description} onChange={(e) => setCertData({...certData, description: e.target.value})} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};

// 7. PROFILE SECTION
const ProfileSection: React.FC<{ user: any }> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', bio: user?.bio || '', title: user?.title || '' });

  const handleSave = async () => {
    setIsSaving(true);
    try { await api.put('/auth/profile', profile); setIsEditing(false); alert("Profile Updated!"); } catch (e) { alert("Error updating profile"); } finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-700 p-8 shadow-xl shadow-violet-200">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-white">
              <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-4xl font-bold shadow-2xl">
                  {profile.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-center md:text-left mb-2">
                  <h2 className="text-3xl font-bold">{profile.name}</h2>
                  <p className="text-violet-100 opacity-90">{profile.title || 'Instructor'}</p>
              </div>
              <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving} className="px-6 py-2.5 bg-white text-violet-700 rounded-xl font-bold hover:bg-violet-50 transition-all shadow-lg flex items-center gap-2">
                  {isSaving ? <Loader size={18} className="animate-spin"/> : isEditing ? <><Save size={18}/> Save Changes</> : <><Edit2 size={18}/> Edit Profile</>}
              </button>
          </div>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50">
          <h3 className="font-bold text-slate-800 text-lg mb-6 border-b border-slate-50 pb-4">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                 <input disabled={!isEditing} className={`w-full p-3 rounded-xl border ${isEditing ? 'bg-white border-violet-300 focus:ring-2 focus:ring-violet-100' : 'bg-slate-50 border-transparent'} transition-all`} value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
             </div>
             <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title / Role</label>
                 <input disabled={!isEditing} className={`w-full p-3 rounded-xl border ${isEditing ? 'bg-white border-violet-300 focus:ring-2 focus:ring-violet-100' : 'bg-slate-50 border-transparent'} transition-all`} value={profile.title} onChange={(e) => setProfile({...profile, title: e.target.value})} />
             </div>
             <div className="md:col-span-2 space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</label>
                 <textarea disabled={!isEditing} className={`w-full p-3 rounded-xl border ${isEditing ? 'bg-white border-violet-300 focus:ring-2 focus:ring-violet-100' : 'bg-slate-50 border-transparent'} transition-all h-32 resize-none`} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
             </div>
             <div className="md:col-span-2 space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-500 border border-transparent"><Mail size={18}/> {profile.email}</div>
             </div>
          </div>
      </div>
    </div>
  );
};

// 8. DASHBOARD OVERVIEW
const DashboardOverview: React.FC<{ courses: any[], certificatesCount: number }> = ({ courses, certificatesCount }) => {
  const activeCount = courses.filter(c => c.status === 'Active').length;
  const draftCount = courses.filter(c => c.status === 'Draft').length;
  
  const StatCard = ({ label, value, icon: Icon, color, delay }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3.5 rounded-2xl ${color} text-white shadow-md`}><Icon size={24} /></div>
            {label === 'Revenue' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>}
        </div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
    </motion.div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hello, Instructor 👋</h1>
          <p className="text-slate-500 mt-2">Here's what's happening with your content today.</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"><BarChart3 size={18}/> Analytics</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Students" value="0" icon={Users} color="bg-gradient-to-br from-blue-400 to-blue-600" delay={0} />
         <StatCard label="Courses" value={courses.length} icon={BookOpen} color="bg-gradient-to-br from-violet-400 to-violet-600" delay={0.1} />
         <StatCard label="Certificates" value={certificatesCount} icon={Award} color="bg-gradient-to-br from-indigo-400 to-indigo-600" delay={0.2} />
         <StatCard label="Drafts" value={draftCount} icon={Clock} color="bg-gradient-to-br from-amber-400 to-amber-600" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">
           <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><DollarSign size={20} className="text-violet-600"/> Revenue Analytics</h3>
                <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-3 py-2 font-medium outline-none cursor-pointer"><option>This Month</option><option>Last Month</option></select>
           </div>
           <div className="w-full h-72 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200">
              <BarChart3 size={48} className="opacity-20 mb-2"/>
              <span className="text-sm font-medium opacity-50">No data available to display</span>
           </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6">Quick Actions</h3>
           <div className="space-y-3">
             {['Create New Course', 'Add Certificate', 'Account Settings'].map((action, i) => (
                 <button key={i} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-bold hover:bg-violet-50 hover:border-violet-100 hover:text-violet-700 transition-all text-left flex justify-between items-center group">
                    <span className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl shadow-sm text-violet-500"><PlusCircle size={18}/></div>
                        {action}
                    </span>
                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"/>
                 </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD CONTAINER ---
const TutorDashboard: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { myCourses, fetchMyCourses, createCourse, updateCourse, deleteCourse, loading: courseLoading } = useCourse();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- CONNECTED CERTIFICATES STATE ---
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [editingCertificate, setEditingCertificate] = useState<CertificateData | null>(null);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Fetch Certificates API Call
  const fetchCertificates = async () => {
    setLoadingCerts(true);
    try {
        const { data } = await api.get('/certificates/mycertificates');
        // Map MongoDB _id to frontend id
        const mappedData = data.map((cert: any) => ({
            ...cert,
            id: cert._id 
        }));
        setCertificates(mappedData);
    } catch (error) {
        console.error("Error fetching certificates", error);
    } finally {
        setLoadingCerts(false);
    }
  };

  useEffect(() => { 
      if(!authLoading) {
          if (!user) {
              navigate('/login');
          } else if (user.role !== 'instructor') {
              navigate('/'); // Redirect to home if they are a student
          }
      }
  }, [user, authLoading, navigate]);

  useEffect(() => { 
      if(user?.role === 'instructor') {
          fetchMyCourses(); 
          fetchCertificates(); // <-- Fetch certificates on load
      }
  }, [user]);

  // --- COURSE CRUD LOGIC ---
  const handleEditCourse = (course: any) => {
    const mapped = {
        id: course._id, 
        title: course.title, 
        description: course.description, 
        price: course.price, 
        category: course.category, 
        status: course.status, 
        thumbnail: course.thumbnail?.url,
        topics: course.sections?.map((sec: any) => ({ 
            id: sec._id || Date.now(), 
            title: sec.title, 
            videos: sec.lessons?.map((les: any) => ({ 
                id: les._id, 
                title: les.title, 
                videoKey: les.videoKey, 
                duration: les.videoDuration?.toString(), 
                isFree: les.isFree,
                description: les.description || '' 
            })) || [] 
        })) || []
    };
    setEditingCourse(mapped); 
    setActiveTab('add_course');
  };

  const handleSaveCourse = async (data: CourseData) => {
    setIsSaving(true);
    const payload = {
        title: data.title, 
        description: data.description, 
        price: Number(data.price), 
        category: data.category, 
        status: data.status,
        thumbnail: data.thumbnail ? { url: data.thumbnail } : undefined,
        sections: data.topics.map((t) => ({ 
            title: t.title, 
            lessons: t.videos.map((v) => ({ 
                title: v.title, 
                type: 'video', 
                videoKey: v.videoKey, 
                videoDuration: parseInt(v.duration || '0'),
                description: v.description 
            })) 
        }))
    };
    const result = editingCourse?.id ? await updateCourse(editingCourse.id, payload) : await createCourse(payload);
    setIsSaving(false);
    if (result.success) { setEditingCourse(null); setActiveTab('active_courses'); } else { alert(result.message); }
  };

  const handleDeleteCourse = async (id: string) => { if(confirm("Delete this course?")) await deleteCourse(id); };

  // --- CERTIFICATE CRUD LOGIC (CONNECTED TO API) ---
  const handleEditCertificate = (cert: CertificateData) => {
      setEditingCertificate(cert);
      setActiveTab('add_certificate');
  }

  const handleDeleteCertificate = async (id: string) => {
      if(confirm("Delete this certificate?")) {
          try {
              await api.delete(`/certificates/${id}`);
              setCertificates(prev => prev.filter(c => c.id !== id));
          } catch (error: any) {
              alert(error.response?.data?.message || "Failed to delete certificate");
          }
      }
  }

  const handleSaveCertificate = async (data: CertificateData) => {
      setIsSaving(true);
      try {
          // Construct Payload mapping local fields to backend Schema fields
          const payload = {
              title: data.title,
              description: data.description,
              genre: data.genre,
              link: data.link,
              status: data.status,
              thumbnail: data.thumbnail
          };

          if (data.id) {
              // Update existing
              await api.put(`/certificates/${data.id}`, payload);
          } else {
              // Create new
              await api.post('/certificates', payload);
          }
          
          await fetchCertificates(); // Refresh the list from database
          setEditingCertificate(null);
          setActiveTab('certificates');

      } catch (error: any) {
          alert(error.response?.data?.message || "Failed to save certificate");
      } finally {
          setIsSaving(false);
      }
  }

  if(authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="animate-spin text-violet-600"/></div>;

  // Prevent rendering the dashboard while the redirect is happening
  if (!user || user.role !== 'instructor') return null; 

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-600 selection:bg-violet-200 selection:text-violet-900">
      <Sidebar 
        activeTab={activeTab === 'add_certificate' ? 'certificates' : activeTab} 
        setActiveTab={(t: string) => { 
            if(t !== 'add_course') setEditingCourse(null); 
            if(t !== 'certificates') setEditingCertificate(null);
            setActiveTab(t); 
        }} 
        onLogout={() => { logout(); navigate('/login'); }} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 sticky top-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24}/></button>
             <span className="font-bold text-slate-900 text-lg">TutorPanel</span>
          </div>
          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-xs">{user?.name?.[0] || 'T'}</div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.3 }}
              className="pb-20"
            >
              {
                activeTab === 'overview' ? <DashboardOverview courses={myCourses} certificatesCount={certificates.length} /> :
                activeTab === 'active_courses' ? <CourseList status="Active" courses={myCourses} onEdit={handleEditCourse} onDelete={handleDeleteCourse} isLoading={courseLoading} /> :
                activeTab === 'add_course' ? <CourseBuilder initialData={editingCourse} onSave={handleSaveCourse} onCancel={() => setActiveTab('active_courses')} isSaving={isSaving} /> :
                
                // CERTIFICATE TABS ROUTING
                activeTab === 'certificates' ? <CertificateList certificates={certificates} onEdit={handleEditCertificate} onDelete={handleDeleteCertificate} onCreateClick={() => { setEditingCertificate(null); setActiveTab('add_certificate'); }} isLoading={loadingCerts} /> :
                activeTab === 'add_certificate' ? <CertificateBuilder initialData={editingCertificate} onSave={handleSaveCertificate} onCancel={() => setActiveTab('certificates')} isSaving={isSaving} /> :
                
                <ProfileSection user={user} />
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;


// check that it work correctly