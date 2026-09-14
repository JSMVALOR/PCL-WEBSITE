/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { Calendar, User, ArrowRight, PenTool } from 'lucide-react';
import styles from '../PROGRAMS/Programs.module.css';

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80';

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
                className={`gsap-fade-up group block relative overflow-hidden rounded-[24px] border border-[var(--card-border)] bg-[var(--card-bg)] shadow-md hover:border-[var(--primary-color)]/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500`}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500" style={{ background: 'radial-gradient(circle at top right, var(--primary-color), transparent 70%)' }} />
                
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] md:aspect-[3/2] overflow-hidden bg-[var(--bg-color)]">
                    <img decoding="async" loading="lazy" 
                        src={blog.image_url || FALLBACK_IMG} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent opacity-80" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 flex gap-2 z-20">
                        <span className="bg-[var(--primary-color)] text-black px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-lg border border-[var(--primary-color)]/20">
                            Blog
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 md:p-8 flex flex-col relative z-10 bg-[var(--card-bg)]">
                    <h3 className="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-3 leading-tight group-hover:text-[var(--primary-color)] transition-colors line-clamp-2">
                        {blog.title}
                    </h3>
                    
                    <div className="flex flex-col gap-2 text-[10px] md:text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase mb-4">
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-[var(--primary-color)]"/> {pubDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-2"><User size={14} className="text-[var(--primary-color)]"/> {blog.author_name || 'Admin'}</span>
                    </div>
                    
                    <div className="mt-2 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-[var(--text-muted)] group-hover:text-[var(--primary-color)] transition-colors">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Read Post</span>
                        <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform" />
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
