import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  PlayCircle, Lock, ChevronDown, ChevronUp, 
  Clock, ChevronLeft, Menu, X, 
  FileText, Code, HelpCircle, 
  Download, Copy, CheckCircle2, XCircle, 
  CheckSquare, MonitorPlay, MessageCircle, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useCourse } from '../../context/CourseContext'; 

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface Resource { _id?: string; title: string; url: string; }
export interface CodeSnippet { _id?: string; language: string; code: string; }
export interface QuizOption { _id?: string; text: string; isCorrect: boolean; }
export interface Quiz { _id?: string; question: string; options: QuizOption[]; }

export interface Lesson {
    _id: string;
    title: string;
    videoKey?: string;
    videoDuration: number;
    isFree: boolean;
    description?: string;
    resources?: Resource[];
    codeSnippets?: CodeSnippet[];
    quizzes?: Quiz[];
}

export interface Section { _id: string; title: string; lessons: Lesson[]; }

export interface Course {
    _id: string;
    title: string;
    description: string;
    sections: Section[];
    updatedAt: string;
    rating?: number;
    studentsEnrolled?: number;
    instructor?: { name: string; avatar?: string; title?: string };
}

// ==========================================
// 2. UTILITY FUNCTIONS
// ==========================================

const formatDuration = (seconds: number): string => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
};

// ==========================================
// 3. CUSTOM HOOK (Business Logic)
// ==========================================

const useCourseLogic = () => {
    const { id } = useParams(); 
    const { fetchCourseById } = useCourse(); 

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            try {
                if (!id) throw new Error("No Course ID");
                const data = await fetchCourseById(id);
                
                if (isMounted && data) {
                    setCourse(data);
                    // Initialize: Open first section & play first lesson
                    if (data.sections?.length > 0) {
                        const firstSection = data.sections[0];
                        setExpandedSections(new Set([firstSection._id]));
                        if (firstSection.lessons?.length > 0) {
                            setActiveLesson(firstSection.lessons[0]); 
                        }
                    }
                } else if (isMounted) {
                    setError("Course not found.");
                }
            } catch (err: any) {
                if (isMounted) setError("Failed to load course."); 
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [id, fetchCourseById]);

    const toggleSection = useCallback((sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) newSet.delete(sectionId);
            else newSet.add(sectionId);
            return newSet;
        });
    }, []);

    const selectLesson = useCallback((lesson: Lesson) => {
        setActiveLesson(lesson);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Placeholder progress logic
    const progressPercentage = 0; 

    return { 
        course, loading, error, activeLesson, 
        expandedSections, toggleSection, selectLesson, progressPercentage 
    };
};

// ==========================================
// 4. SUB-COMPONENTS (Feature Blocks)
// ==========================================

// --- Resources Block ---
const ResourceBlock: React.FC<{ resources: Resource[] }> = ({ resources }) => (
    <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden mb-8 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
            <FileText size={20} className="text-blue-400"/>
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Downloadable Resources</h3>
        </div>
        <div className="divide-y divide-slate-700">
            {resources.map((res, idx) => (
                <a key={idx} href={res.url.startsWith('http') ? res.url : `https://${res.url}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors group">
                    {/* <p>{res.url}</p> */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Download size={18}/>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{res.title}</p>
                            <p className="text-xs text-slate-500">Click to open file</p>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    </div>
);

// --- Code Snippet Block ---
const CodeBlock: React.FC<{ snippets: CodeSnippet[] }> = ({ snippets }) => (
    <div className="space-y-6 mb-8">
        {snippets.map((snippet, idx) => (
            <div key={idx} className="bg-[#0f172a] border border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                        <Code size={16} className="text-emerald-400"/>
                        <span className="text-xs font-bold uppercase tracking-wider">{snippet.language}</span>
                    </div>
                    <button 
                        onClick={() => navigator.clipboard.writeText(snippet.code)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors uppercase font-semibold"
                    >
                        <Copy size={12}/> Copy
                    </button>
                </div>
                <div className="p-4 overflow-x-auto custom-scrollbar">
                    <pre className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre font-medium">
                        <code>{snippet.code}</code>
                    </pre>
                </div>
            </div>
        ))}
    </div>
);

// --- Interactive Quiz Block ---
const QuizModule: React.FC<{ quizzes: Quiz[] }> = ({ quizzes }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

    const handleSelect = (qIdx: number, oIdx: number) => {
        if (!submitted[qIdx]) setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden mb-8 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
                <HelpCircle size={20} className="text-amber-400"/>
                <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Knowledge Check</h3>
            </div>
            <div className="p-6 space-y-8">
                {quizzes.map((quiz, qIdx) => {
                    const selected = answers[qIdx];
                    const isSub = submitted[qIdx];
                    const isCorrect = isSub && quiz.options[selected]?.isCorrect;

                    return (
                        <div key={qIdx} className="space-y-4">
                            <h4 className="text-base font-semibold text-white flex gap-3">
                                <span className="text-slate-500 font-mono">{qIdx + 1}.</span>
                                {quiz.question}
                            </h4>
                            <div className="space-y-2 pl-6">
                                {quiz.options.map((opt, oIdx) => {
                                    let style = "border-slate-700 hover:bg-slate-700/50 text-slate-400";
                                    if (isSub) {
                                        if (opt.isCorrect) style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
                                        else if (selected === oIdx && !opt.isCorrect) style = "border-rose-500/50 bg-rose-500/10 text-rose-400";
                                    } else if (selected === oIdx) {
                                        style = "border-violet-500 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]";
                                    }

                                    return (
                                        <button
                                            key={oIdx}
                                            onClick={() => handleSelect(qIdx, oIdx)}
                                            disabled={isSub}
                                            className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${style}`}
                                        >
                                            <span className="text-sm font-medium">{opt.text}</span>
                                            {isSub && opt.isCorrect && <CheckCircle2 size={18}/>}
                                            {isSub && selected === oIdx && !opt.isCorrect && <XCircle size={18}/>}
                                        </button>
                                    );
                                })}
                            </div>
                            {!isSub && (
                                <div className="pl-6 pt-2">
                                    <button 
                                        onClick={() => setSubmitted(prev => ({ ...prev, [qIdx]: true }))}
                                        disabled={selected === undefined}
                                        className="px-6 py-2 bg-violet-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-900/20"
                                    >
                                        Submit Answer
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Loading Skeleton ---
const CourseSkeleton = () => (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
        <div className="max-w-[1600px] mx-auto grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="w-full aspect-video bg-slate-900 rounded-xl animate-pulse" />
                <div className="h-8 w-3/4 bg-slate-900 rounded animate-pulse" />
                <div className="space-y-3">
                    <div className="h-4 w-full bg-slate-900 rounded animate-pulse" />
                    <div className="h-4 w-full bg-slate-900 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-slate-900 rounded animate-pulse" />
                </div>
            </div>
            <div className="hidden lg:block h-[600px] bg-slate-900 rounded-xl animate-pulse" />
        </div>
    </div>
);

// --- Sidebar Item (Memoized) ---
const LessonItem = memo(({ lesson, index, isActive, onClick }: { lesson: Lesson, index: number, isActive: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 pl-5 transition-all duration-200 border-l-[3px] text-left group
        ${isActive ? 'bg-slate-900 border-violet-500' : 'bg-transparent border-transparent hover:bg-slate-900/50'}`}
    >
        <div className="mt-0.5 shrink-0 text-slate-500 transition-colors group-hover:text-slate-400">
            {isActive ? <PlayCircle size={14} className="text-violet-400 fill-violet-400/20" /> : 
             lesson.isFree ? <CheckSquare size={14} /> : <Lock size={14} />}
        </div>
        <div className="flex-1 min-w-0">
            <p className={`text-sm leading-tight line-clamp-2 transition-colors ${isActive ? 'text-violet-300 font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {index + 1}. {lesson.title}
            </p>
            <div className="flex items-center gap-3 mt-1.5 opacity-60">
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <MonitorPlay size={10} /> {formatDuration(lesson.videoDuration)}
                </span>
                {/* Visual Indicators for Features */}
                <div className="flex gap-2">
                    {lesson.resources && lesson.resources.length > 0 && <FileText size={10} className="text-blue-400" />}
                    {lesson.codeSnippets && lesson.codeSnippets.length > 0 && <Code size={10} className="text-emerald-400" />}
                    {lesson.quizzes && lesson.quizzes.length > 0 && <HelpCircle size={10} className="text-amber-400" />}
                </div>
            </div>
        </div>
    </button>
));

// ==========================================
// 5. MAIN COMPONENT
// ==========================================

const CourseDetail = () => {
    const { 
        course, loading, error, activeLesson, 
        expandedSections, toggleSection, selectLesson, progressPercentage 
    } = useCourseLogic();

    const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'notes'>('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // --- Loading & Error States ---
    if (loading) return <CourseSkeleton />;
    
    if (error || !course) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
            <AlertCircle size={48} className="text-rose-500/50" />
            <p className="text-lg font-medium">{error || "Course unavailable"}</p>
            <Link to="/active-course" className="text-violet-400 hover:text-violet-300 hover:underline underline-offset-4 text-sm font-medium">
                Return to Dashboard
            </Link>
        </div>
    );

    // --- Render ---
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-violet-500/30">
            
            {/* --- NAVBAR --- */}
            <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center px-4 lg:px-8 justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/active-course" className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white group">
                        <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform"/>
                    </Link>
                    <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
                    <h1 className="text-slate-200 font-bold text-sm sm:text-base lg:text-lg line-clamp-1 max-w-xl">
                        {course.title}
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Progress</span>
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                    <button className="lg:hidden p-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={24}/>
                    </button>
                </div>
            </nav>

            {/* --- MAIN LAYOUT --- */}
            <div className="max-w-[1600px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT: VIDEO & CONTENT (Scrollable) --- */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    {/* VIDEO PLAYER */}
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-slate-700/50 relative group">
                        {activeLesson?.videoKey ? (
                            <iframe 
                                width="100%" height="100%" 
                                src={`https://www.youtube.com/embed/${activeLesson.videoKey}?autoplay=0&rel=0&modestbranding=1&iv_load_policy=3`} 
                                title="Video Player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-600">
                                <PlayCircle size={64} className="mb-4 opacity-20"/>
                                <p className="font-medium text-sm tracking-wide">SELECT A LESSON TO BEGIN</p>
                            </div>
                        )}
                    </div>

                    {/* CONTENT AREA */}
                    <div className="min-h-[500px]">
                        <div className="mb-6 border-b border-slate-800/50 pb-6">
                            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
                                {activeLesson?.title || "Course Introduction"}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5 text-slate-400">
                                    <Clock size={16} className="text-violet-500"/> 
                                    {activeLesson ? formatDuration(activeLesson.videoDuration) : '0m'}
                                </span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* TABS */}
                        <div className="border-b border-slate-800 flex gap-8 mb-8">
                            {['Overview', 'QA', 'Notes'].map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab.toLowerCase() as any)}
                                    className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize ${
                                        activeTab === tab.toLowerCase() 
                                        ? 'border-violet-500 text-violet-400' 
                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    {tab === 'qa' ? 'Q&A' : tab}
                                </button>
                            ))}
                        </div>

                        {/* TAB CONTENT */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-10"
                                >
                                    {/* Description */}
                                    {activeLesson?.description && (
                                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-7">
                                            <h3 className="text-lg font-bold text-white mb-2">Lesson Notes</h3>
                                            <p className="whitespace-pre-wrap">{activeLesson.description}</p>
                                        </div>
                                    )}

                                    {/* --- DYNAMIC FEATURE BLOCKS --- */}
                                    
                                    {/* Resources */}
                                    {activeLesson?.resources && activeLesson.resources.length > 0 && (
                                        <ResourceBlock resources={activeLesson.resources} />
                                    )}

                                    {/* Code Snippets */}
                                    {activeLesson?.codeSnippets && activeLesson.codeSnippets.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <Code size={20} className="text-emerald-400"/> Code Examples
                                            </h3>
                                            <CodeBlock snippets={activeLesson.codeSnippets} />
                                        </div>
                                    )}

                                    {/* Quizzes */}
                                    {activeLesson?.quizzes && activeLesson.quizzes.length > 0 && (
                                        <QuizModule quizzes={activeLesson.quizzes} />
                                    )}

                                    <div className="h-px bg-slate-800 my-10 w-full"></div>

                                    {/* Course Description Fallback */}
                                    <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50">
                                        <h3 className="text-lg font-bold text-white mb-4">About this Course</h3>
                                        <p className="text-slate-400 leading-7 text-sm">{course.description}</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-24 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20"
                                >
                                    <MessageCircle size={48} className="mb-4 opacity-20"/>
                                    <p className="font-medium text-sm">This feature is currently under development.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- RIGHT: CURRICULUM SIDEBAR (Sticky) --- */}
                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-24 space-y-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-8rem)]">
                            <div className="p-5 border-b border-slate-800 bg-slate-950 z-10 flex items-center justify-between">
                                <h3 className="font-bold text-white text-base">Course Content</h3>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                    {course.sections?.reduce((acc: number, s: any) => acc + s.lessons.length, 0)} Lessons
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
                                {course.sections?.map((section: Section, sIdx: number) => (
                                    <div key={section._id} className="border-b border-slate-900">
                                        <button 
                                            onClick={() => toggleSection(section._id)}
                                            className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-900 transition-colors text-left group border-l-2 border-transparent"
                                        >
                                            <div className="min-w-0 pr-4">
                                                <h4 className="text-sm font-bold text-slate-300 group-hover:text-white line-clamp-1 transition-colors">
                                                    Section {sIdx + 1}: {section.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-500 font-medium">
                                                    {section.lessons.length} lessons • {formatDuration(section.lessons.reduce((acc, l) => acc + (l.videoDuration || 0), 0))}
                                                </span>
                                            </div>
                                            {expandedSections.has(section._id) ? <ChevronUp size={14} className="text-slate-500"/> : <ChevronDown size={14} className="text-slate-500"/>}
                                        </button>

                                        <AnimatePresence>
                                            {expandedSections.has(section._id) && (
                                                <motion.div 
                                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} 
                                                    className="overflow-hidden bg-slate-950"
                                                >
                                                    {section.lessons?.map((lesson: Lesson, lIdx) => (
                                                        <LessonItem 
                                                            key={lesson._id}
                                                            lesson={lesson}
                                                            index={lIdx}
                                                            isActive={activeLesson?._id === lesson._id}
                                                            onClick={() => { selectLesson(lesson); setMobileMenuOpen(false); }}
                                                        />
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MOBILE CURRICULUM DRAWER --- */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                                onClick={() => setMobileMenuOpen(false)} 
                                className="fixed inset-0 bg-black/80 z-50 lg:hidden backdrop-blur-sm" 
                            />
                            <motion.div 
                                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
                                className="fixed inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-800 z-50 lg:hidden shadow-2xl flex flex-col"
                            >
                                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                                    <h3 className="font-bold text-white">Course Content</h3>
                                    <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                                        <X size={20}/>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {/* Reusing sidebar logic for mobile */}
                                    {course.sections?.map((section: Section, sIdx: number) => (
                                        <div key={section._id} className="border-b border-slate-900">
                                            <div className="p-4 bg-slate-900/50 border-l-2 border-transparent">
                                                <h4 className="text-sm font-bold text-slate-300 line-clamp-1">Section {sIdx + 1}: {section.title}</h4>
                                            </div>
                                            <div>
                                                {section.lessons?.map((lesson: Lesson, lIdx) => (
                                                    <LessonItem 
                                                        key={lesson._id}
                                                        lesson={lesson}
                                                        index={lIdx}
                                                        isActive={activeLesson?._id === lesson._id}
                                                        onClick={() => { selectLesson(lesson); setMobileMenuOpen(false); }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default CourseDetail;