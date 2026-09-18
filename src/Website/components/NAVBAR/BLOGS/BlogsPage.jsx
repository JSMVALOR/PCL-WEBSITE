/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, User, ArrowRight, PenTool } from 'lucide-react';
import styles from '../PROGRAMS/Programs.module.css';

gsap.registerPlugin(ScrollTrigger);


export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('admin_notices')
                    .select('*')
                    .eq('category', 'Blog')
                    .eq('is_public', true)
                    .order('created_at', { ascending: false });
                setBlogs(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        if (loading) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.gsap-fade-up',
                { opacity: 0, y: 40 },
                {
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8, 
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loading, blogs, activeCategory]);

    const categories = useMemo(() => {
        const unique = new Set(blogs.map((b) => b.category || 'Announcement'));
        return ['All', ...unique];
    }, [blogs]);

    const filteredBlogs = useMemo(() => {
        if (activeCategory === 'All') return blogs;
        return blogs.filter((b) => (b.category || 'Announcement') === activeCategory);
    }, [blogs, activeCategory]);

    const renderBlogCard = (blog) => {
        const pubDate = new Date(blog.created_at);
        return (
            <Link
                key={blog.id}
                to={`/blogs/${blog.id}`}
                className={`gsap-fade-up group block relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-sm hover:border-[var(--primary-color)]/30 hover:shadow-md transition-all duration-300`}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" style={{ background: 'radial-gradient(circle at top right, var(--primary-color), transparent 70%)' }} />
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                            Blog
                        </span>
                        <div className="flex items-center text-[var(--text-muted)] text-xs font-medium gap-1.5">
                            <Calendar size={12} />
                            {pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[var(--text-color)] mb-4 leading-snug group-hover:text-[var(--primary-color)] transition-colors line-clamp-2">
                        {blog.title}
                    </h3>
                    
                    <p className="text-[var(--text-muted)] text-sm mb-8 line-clamp-3 leading-relaxed font-light">
                        {blog.content ? blog.content.substring(0, 150) + '...' : 'Click to read full post...'}
                    </p>
                    
                    <div className="mt-auto pt-5 border-t border-[var(--card-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[var(--text-color)]">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-color)] flex items-center justify-center border border-[var(--card-border)]">
                                <User size={14} className="text-[var(--text-muted)]" />
                            </div>
                            <span className="text-xs font-bold tracking-tight">{blog.author_name || 'Editorial Team'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--primary-color)] text-xs font-bold uppercase tracking-widest">
                            <span>Read</span>
                            <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientBackground} />
            <div className={styles.auroraGlow} />

            <div className={styles.contentContainer} ref={containerRef}>
                {/* Header */}
                <div className="text-center mb-16 md:mb-24 relative z-10 pt-32">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--primary-color)] mb-6 leading-tight"
                    >
                        News & Insights
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed mb-10 font-light"
                    >
                        Explore our views on latest updates, insights and analysis to help you navigate the evolving legal landscape.
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex justify-center"
                    >
                        <Link to="/blogs/submit" className="tlh-btn flex justify-center !py-4 px-10">
                            <span className="text-xs font-bold uppercase tracking-widest flex items-center">
                                <PenTool className="w-4 h-4 mr-2" />
                                Submit a Post
                            </span>
                        </Link>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-32 relative z-10">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-[var(--primary-color)] rounded-full animate-spin mb-4"></div>
                        <p className="text-white/50 tracking-widest uppercase text-sm font-bold">Loading Posts...</p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        {filteredBlogs.length === 0 ? (
                            <div className="py-20 text-center border border-white/10 rounded-2xl bg-[#1a1818]">
                                <p className="text-white/50 text-xl font-light">No posts found in this category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredBlogs.map((blog) => renderBlogCard(blog))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
