import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit2, PlusCircle, Save, Loader, Settings, BookOpen,
    Layers, Plus, Trash2, Image as ImageIcon,
    AlignLeft, ListChecks, GraduationCap, ChevronDown, ChevronUp
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import VideoRow from './VideoRow';
import type { VideoItem } from './VideoRow';
import SyllabusBuilder from './SyllabusBuilder';
import type { SyllabusTopic } from './SyllabusBuilder';

interface TopicItem { id: number | string; title: string; videos: VideoItem[]; }

export interface CourseData {
    id?: string;
    title: string;
    description: string;
    price: string;
    category: string;
    status: 'Active' | 'Inactive' | 'Draft';
    thumbnail: string | null;
    topics: TopicItem[];
    level?: string;
    learningPoints?: string[];
    requirements?: string[];
    syllabus?: SyllabusTopic[];
}

const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/uploads') || url.startsWith('\\uploads')) {
        return `http://13.127.138.86:5000${url.replace(/\\/g, '/')}`;
        // return `http://localhost:5000${url.replace(/\\/g, '/')}`;
    }
    return url;
};

const TABS = [
    { id: 'details', label: 'Basic Info', icon: Settings },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'syllabus', label: 'Syllabus', icon: GraduationCap },
];

interface CourseBuilderProps {
    initialData?: any;
    onSave: (data: CourseData) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const InputField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{label}</label>
        {children}
    </div>
);

const inputClass = "w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-sm text-gray-800 transition-all";
const selectClass = "w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-sm text-gray-800 transition-all cursor-pointer";

const CourseBuilder: React.FC<CourseBuilderProps> = ({ initialData, onSave, onCancel, isSaving }) => {
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'curriculum' | 'syllabus'>('details');
    const { uploadCourseAsset } = useCourse();

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
                topics: initialData.topics || [],
                level: initialData.level || 'All Levels',
                learningPoints: initialData.learningPoints || [],
                requirements: initialData.requirements || [],
                syllabus: initialData.syllabus || [],
            };
        }
        return {
            title: '', description: '', price: '', category: 'Development',
            status: 'Draft', thumbnail: null,
            topics: [{ id: Date.now(), title: 'Module 1: Introduction', videos: [] }],
            level: 'All Levels', learningPoints: [], requirements: [], syllabus: [],
        };
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setUploading(true);
            const result = await uploadCourseAsset(e.target.files[0]);
            if (result.success) setCourseData(prev => ({ ...prev, thumbnail: result.url }));
            else alert('Image upload failed: ' + result.message);
            setUploading(false);
        }
    };

    const handleAddTopic = () => setCourseData(prev => ({
        ...prev, topics: [...prev.topics, { id: Date.now(), title: '', videos: [] }]
    }));

    const handleAddVideo = (tId: number | string) => setCourseData(prev => ({
        ...prev, topics: prev.topics.map(t => t.id === tId ? {
            ...t, videos: [...t.videos, {
                id: Date.now(), title: '', videoKey: '', duration: '', isFree: false,
                description: '', resources: [], codeSnippets: [], quizzes: [], subParts: []
            }]
        } : t)
    }));

    const updateTopic = (id: number | string, val: string) => setCourseData(prev => ({
        ...prev, topics: prev.topics.map(t => t.id === id ? { ...t, title: val } : t)
    }));

    const updateVideo = (tId: number | string, vId: number | string, field: string, val: any) => setCourseData(prev => ({
        ...prev, topics: prev.topics.map(t => t.id === tId ? {
            ...t, videos: t.videos.map(v => v.id === vId ? { ...v, [field]: val } : v)
        } : t)
    }));

    const deleteTopic = (id: number | string) => setCourseData(prev => ({
        ...prev, topics: prev.topics.filter(t => t.id !== id)
    }));

    const deleteVideo = (tId: number | string, vId: number | string) => setCourseData(prev => ({
        ...prev, topics: prev.topics.map(t => t.id === tId ? {
            ...t, videos: t.videos.filter(v => v.id !== vId)
        } : t)
    }));

    const handleAddPoint = (field: 'learningPoints' | 'requirements') =>
        setCourseData(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));

    const handleUpdatePoint = (field: 'learningPoints' | 'requirements', idx: number, val: string) => {
        const arr = [...(courseData[field] || [])];
        arr[idx] = val;
        setCourseData(prev => ({ ...prev, [field]: arr }));
    };

    const handleRemovePoint = (field: 'learningPoints' | 'requirements', idx: number) =>
        setCourseData(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== idx) }));

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-5">
            {/* Sticky Toolbar */}
            <div className="sticky top-0 z-30 bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a435f0, #7c3aed)' }}>
                        {initialData ? <Edit2 size={14} className="text-white" /> : <Plus size={14} className="text-white" />}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">{initialData ? 'Edit Course' : 'Create New Course'}</h2>
                        <p className="text-xs text-gray-400 hidden sm:block">{initialData ? 'Update your course content and details' : 'Fill in the details below to create your course'}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0.5 p-1 bg-gray-100 rounded-lg">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <tab.icon size={12} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={onCancel} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onSave(courseData)} disabled={isSaving || uploading} className="flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 hover:opacity-90" style={{ background: 'linear-gradient(135deg, #a435f0, #7c3aed)' }}>
                        {isSaving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />} Save Course
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

                    {/* DETAILS TAB */}
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Left Column */}
                            <div className="lg:col-span-5 space-y-4">
                                {/* Thumbnail */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><ImageIcon size={14} className="text-purple-600" /> Course Thumbnail</h3>
                                    <div className="group relative w-full aspect-video rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-purple-400 overflow-hidden transition-all cursor-pointer">
                                        {uploading ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                                                <Loader className="animate-spin text-purple-600 mb-2" size={24} />
                                                <span className="text-xs font-medium text-purple-600">Uploading...</span>
                                            </div>
                                        ) : courseData.thumbnail ? (
                                            <>
                                                <img src={getImageUrl(courseData.thumbnail)} alt="Thumbnail" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                                                <ImageIcon size={28} className="mb-2 opacity-40" />
                                                <span className="text-sm font-medium">Click to upload</span>
                                                <span className="text-xs text-gray-300 mt-1">PNG, JPG · 1280×720 recommended</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                </div>

                                {/* Status + Category + Level */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Settings size={14} className="text-purple-600" /> Course Settings</h3>
                                    <InputField label="Status">
                                        <select className={selectClass} value={courseData.status} onChange={e => setCourseData({ ...courseData, status: e.target.value as any })}>
                                            <option value="Draft">Draft</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </InputField>
                                    <InputField label="Category">
                                        <select className={selectClass} value={courseData.category} onChange={e => setCourseData({ ...courseData, category: e.target.value })}>
                                            {['Development', 'Business', 'Design', 'Marketing', 'Photography', 'Music', 'IT & Software', 'Personal Development'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </InputField>
                                    <InputField label="Level">
                                        <select className={selectClass} value={courseData.level} onChange={e => setCourseData({ ...courseData, level: e.target.value })}>
                                            {['All Levels', 'Beginner', 'Intermediate', 'Expert'].map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </InputField>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="lg:col-span-7 space-y-4">
                                {/* Core Info */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2"><AlignLeft size={14} className="text-purple-600" /> Course Details</h3>
                                    <InputField label="Title *">
                                        <input type="text" className={inputClass} placeholder="e.g. Complete Web Development Bootcamp 2026" value={courseData.title} onChange={e => setCourseData({ ...courseData, title: e.target.value })} />
                                    </InputField>
                                    <InputField label="Price (INR ₹)">
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">₹</span>
                                            <input type="number" className={`${inputClass} pl-8`} placeholder="0" value={courseData.price} onChange={e => setCourseData({ ...courseData, price: e.target.value })} />
                                        </div>
                                    </InputField>
                                    <InputField label="Description">
                                        <textarea className={`${inputClass} h-28 resize-none`} placeholder="What will students learn? Who is this course for? What makes it unique?" value={courseData.description} onChange={e => setCourseData({ ...courseData, description: e.target.value })} />
                                    </InputField>
                                </div>

                                {/* What students will learn */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><ListChecks size={14} className="text-green-600" /> What Students Will Learn</h3>
                                    <div className="space-y-2">
                                        {(courseData.learningPoints || []).map((p, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <span className="text-green-500 text-sm shrink-0">✓</span>
                                                <input type="text" className={`${inputClass} flex-1`} placeholder="e.g. Build real-world projects from scratch" value={p} onChange={e => handleUpdatePoint('learningPoints', i, e.target.value)} />
                                                <button onClick={() => handleRemovePoint('learningPoints', i)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors shrink-0"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => handleAddPoint('learningPoints')} className="w-full py-2.5 border border-dashed border-green-200 rounded-lg text-green-600 text-sm font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-1.5">
                                            <Plus size={14} /> Add Learning Point
                                        </button>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><Layers size={14} className="text-amber-500" /> Requirements & Prerequisites</h3>
                                    <div className="space-y-2">
                                        {(courseData.requirements || []).map((r, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <span className="text-amber-500 text-sm shrink-0">→</span>
                                                <input type="text" className={`${inputClass} flex-1`} placeholder="e.g. Basic understanding of HTML" value={r} onChange={e => handleUpdatePoint('requirements', i, e.target.value)} />
                                                <button onClick={() => handleRemovePoint('requirements', i)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors shrink-0"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => handleAddPoint('requirements')} className="w-full py-2.5 border border-dashed border-amber-200 rounded-lg text-amber-600 text-sm font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5">
                                            <Plus size={14} /> Add Requirement
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CURRICULUM TAB */}
                    {activeTab === 'curriculum' && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm"><BookOpen size={16} className="text-purple-600" /> Course Curriculum</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{courseData.topics.length} section{courseData.topics.length !== 1 ? 's' : ''} · {courseData.topics.reduce((a, t) => a + t.videos.length, 0)} lessons · Sub-parts supported</p>
                                </div>
                                <button onClick={handleAddTopic} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #a435f0, #7c3aed)' }}>
                                    <PlusCircle size={14} /> Add Section
                                </button>
                            </div>

                            {courseData.topics.length === 0 && (
                                <div className="flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-gray-400">
                                    <Layers size={36} className="mb-3 opacity-20" />
                                    <p className="font-medium text-sm">No sections yet</p>
                                    <button onClick={handleAddTopic} className="mt-3 text-purple-600 hover:underline text-sm">+ Add your first section</button>
                                </div>
                            )}

                            <AnimatePresence>
                                {courseData.topics.map((topic, tIndex) => (
                                    <motion.div key={topic.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        {/* Section Header */}
                                        <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border-b border-gray-200">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0" style={{ background: 'linear-gradient(135deg, #a435f0, #7c3aed)' }}>
                                                {tIndex + 1}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Section Title (e.g. Module 1: Getting Started)"
                                                className="flex-1 bg-transparent font-semibold text-gray-800 text-sm placeholder:text-gray-400 outline-none border-b border-transparent focus:border-purple-400 pb-0.5"
                                                value={topic.title}
                                                onChange={e => updateTopic(topic.id, e.target.value)}
                                            />
                                            <button onClick={() => deleteTopic(topic.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Lessons */}
                                        <div className="p-3 space-y-2">
                                            {topic.videos.map(video => (
                                                <VideoRow key={video.id} video={video} topicId={topic.id} updateVideo={updateVideo} deleteVideo={deleteVideo} />
                                            ))}
                                            <button onClick={() => handleAddVideo(topic.id)} className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2 text-sm">
                                                <PlusCircle size={14} /> Add Lesson
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* SYLLABUS TAB */}
                    {activeTab === 'syllabus' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <SyllabusBuilder
                                syllabus={courseData.syllabus || []}
                                onChange={(updated) => setCourseData(prev => ({ ...prev, syllabus: updated }))}
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CourseBuilder;
