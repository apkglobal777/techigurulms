import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award, Search, Edit2, Trash2, PlusCircle, Loader,
    ExternalLink, Link as LinkIcon, Save, Image as ImageIcon
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import api from '../../api/axios';
import { getImageUrl } from '../../config';



interface CertData {
    id?: string;
    title: string;
    description: string;
    genre: string;
    link: string;
    status: 'Active' | 'Inactive' | 'Draft';
    thumbnail: string | null;
}

// ─────────────────────────────── LIST ────────────────────────────────────────

interface CertificateListProps {
    certificates: CertData[];
    onEdit: (cert: CertData) => void;
    onDelete: (id: string) => void;
    onCreateClick: () => void;
    isLoading: boolean;
}

export const CertificateList: React.FC<CertificateListProps> = ({
    certificates, onEdit, onDelete, onCreateClick, isLoading
}) => {
    const [search, setSearch] = useState('');
    const filtered = certificates.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    const statusStyle: Record<string, string> = {
        Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
        Draft: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    const dotStyle: Record<string, string> = {
        Active: 'bg-emerald-500', Inactive: 'bg-slate-400', Draft: 'bg-amber-500',
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                        <Award className="text-violet-600" size={26} /> External Certificates
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Showcase your external certifications and courses</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={16} />
                        <input type="text" placeholder="Search certificates..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 text-sm transition-all shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button onClick={onCreateClick} className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                        <PlusCircle size={15} /> Add
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100">
                    <Loader className="animate-spin text-violet-600 mb-4" size={36} />
                    <p className="text-slate-400 font-medium">Loading certificates...</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    {['Certificate', 'Genre', 'External Link', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/80">
                                {filtered.length > 0 ? filtered.map((cert: any) => (
                                    <tr key={cert.id} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm">
                                                    <img src={getImageUrl(cert.thumbnail)} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors line-clamp-1 max-w-[180px]">{cert.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg">{cert.genre}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <a href={cert.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-violet-300 hover:text-violet-700 rounded-lg text-xs font-semibold text-slate-600 transition-colors">
                                                <LinkIcon size={12} /> View <ExternalLink size={11} className="opacity-50" />
                                            </a>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle[cert.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${dotStyle[cert.status] || 'bg-slate-400'}`} />
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onEdit(cert)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                                                <button onClick={() => onDelete(cert.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center"><Award size={28} className="opacity-20" /></div>
                                                <p className="font-semibold">{search ? `No results for "${search}"` : 'No certificates yet. Add your first!'}</p>
                                                {!search && <button onClick={onCreateClick} className="mt-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors flex items-center gap-2"><PlusCircle size={14} /> Add Certificate</button>}
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

// ─────────────────────────────── BUILDER ──────────────────────────────────────

interface CertificateBuilderProps {
    initialData?: CertData | null;
    onSave: (data: CertData) => void;
    onCancel: () => void;
    isSaving: boolean;
}

export const CertificateBuilder: React.FC<CertificateBuilderProps> = ({
    initialData, onSave, onCancel, isSaving
}) => {
    const [uploading, setUploading] = useState(false);
    const { uploadCourseAsset } = useCourse();

    const [certData, setCertData] = useState<CertData>(() => {
        if (initialData) {
            return {
                id: (initialData as any).id || (initialData as any)._id,
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
            setUploading(true);
            const result = await uploadCourseAsset(e.target.files[0]);
            if (result.success) setCertData(prev => ({ ...prev, thumbnail: result.url }));
            else alert('Image upload failed');
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-5">
            {/* Toolbar */}
            <div className="sticky top-4 z-30 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <Award size={14} className="text-white" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{initialData ? 'Edit Certificate' : 'Add Certificate'}</h2>
                </div>
                <div className="flex gap-2.5 w-full sm:w-auto">
                    <button onClick={onCancel} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 text-sm">Cancel</button>
                    <button onClick={() => onSave(certData)} disabled={isSaving || uploading} className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm">
                        {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Save
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 pb-5 border-b border-slate-50 mb-6 text-base">
                    <Award size={18} className="text-violet-500" /> Certificate Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Thumbnail */}
                    <div className="md:col-span-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Thumbnail</label>
                        <div className="group relative w-full aspect-[4/3] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-violet-400 overflow-hidden transition-all cursor-pointer">
                            {uploading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90"><Loader className="animate-spin text-violet-600 mb-2" size={22} /><span className="text-xs font-semibold text-violet-600">Uploading...</span></div>
                            ) : certData.thumbnail ? (
                                <>
                                    <img src={getImageUrl(certData.thumbnail)} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Change</span>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors">
                                    <ImageIcon size={26} className="mb-2 opacity-50" /><span className="text-xs font-medium">Upload Image</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="md:col-span-8 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Title *</label>
                            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none text-sm font-semibold text-slate-800" placeholder="e.g. AWS Certified Solutions Architect" value={certData.title} onChange={(e) => setCertData({ ...certData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">External Link URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="url" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none text-sm text-slate-800" placeholder="https://..." value={certData.link} onChange={(e) => setCertData({ ...certData, link: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Genre</label>
                                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none text-sm text-slate-800" placeholder="e.g. Cloud Computing" value={certData.genre} onChange={(e) => setCertData({ ...certData, genre: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
                                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none cursor-pointer text-sm text-slate-800" value={certData.status} onChange={(e) => setCertData({ ...certData, status: e.target.value as any })}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                            <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none text-sm text-slate-700 h-24 resize-none" placeholder="Briefly describe what this certificate covers..." value={certData.description} onChange={(e) => setCertData({ ...certData, description: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
