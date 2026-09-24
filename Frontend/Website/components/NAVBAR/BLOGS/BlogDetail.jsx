/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { ArrowLeft, User, Calendar, Tag, Briefcase } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from '../PROGRAMS/Programs.module.css';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      
      const { data, error } = await supabase.from('admin_notices').select('*').eq('id', id).eq('is_public', true).single();
      
      if (data) {
        setBlog(data);
        
        // Fetch ERP Profile if author is from ERP
        if (data.author_id && !data.author_id.startsWith('GUEST:')) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role, programme, department, academic_batch')
            .eq('erp_id', data.author_id)
            .single();
            
          if (profileData) {
            setAuthorProfile(profileData);
          }
        }
      }
      setLoading(false);
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className={`${styles.pageWrapper} flex justify-center items-center`}>
        <div className={styles.ambientBackground} />
        <div className="w-12 h-12 border-4 border-[var(--card-border)] border-t-[var(--primary-color)] rounded-full animate-spin relative z-10"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`${styles.pageWrapper} flex flex-col items-center justify-center text-center px-6`}>
        <div className={styles.ambientBackground} />
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[var(--text-color)] relative z-10">Post Not Found</h2>
        <Link to="/blogs" className="relative z-10 text-[var(--primary-color)] font-bold uppercase tracking-widest text-sm hover:underline transition-all">
          Return to Blogs
        </Link>
      </div>
    );
  }

  const pubDate = new Date(blog.created_at);
  const guestAffiliation = blog.author_id?.startsWith('GUEST:') ? blog.author_id.split('GUEST:')[1] : null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={`${styles.contentContainer} max-w-6xl`}>
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-8 md:mb-12 uppercase tracking-widest text-xs font-bold relative z-10"
        >
          <ArrowLeft size={16} /> BACK TO BLOGS
        </Link>

        

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 relative z-10">
          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-2/3"
          >
            <div className="mb-10">
              <div className="flex gap-4 mb-6">
                <span className="bg-[var(--primary-color)] text-black px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">
                  {blog.category || 'Announcement'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)] leading-[1.1] mb-6">
                {blog.title}
              </h1>
              
              {/* Mobile Author Info (Hidden on Desktop) */}
              <div className="flex lg:hidden items-center gap-4 text-[var(--text-muted)] border-y border-[var(--card-border)] py-4 my-6">
                {authorProfile && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--primary-color)]/30 shrink-0">
                    <img decoding="async" loading="lazy" 
                      src={authorProfile.avatar_url || `https://ui-avatars.com/api/?name=${blog.author_name || 'Admin'}&background=random`} 
                      alt={blog.author_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--text-color)]">{authorProfile?.full_name || blog.author_name || 'Admin'}</span>
                  <span className="text-[10px] uppercase tracking-widest">{pubDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="text-[var(--text-muted)] leading-relaxed text-lg [&>p]:mb-6 [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-[var(--text-color)] [&>h1]:mt-12 [&>h1]:mb-6 [&>h1]:font-serif [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-[var(--text-color)] [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:font-serif [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-[var(--text-color)] [&>h3]:mt-8 [&>h3]:mb-4 [&>h3]:font-serif [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>li]:mb-2 [&>blockquote]:border-l-4 [&>blockquote]:border-[var(--primary-color)] [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:my-8 [&>blockquote]:text-xl [&>a]:text-[var(--primary-color)] [&>a]:underline">
              <ReactMarkdown>{blog.content || ''}</ReactMarkdown>
            </div>
          </motion.div>

          {/* Sticky Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full lg:w-1/3 hidden lg:block"
          >
            <div className="sticky top-32 flex flex-col gap-8">
              
              {/* Author Card */}
              <div className={`${styles.glassCard} p-8 border border-[var(--card-border)] flex flex-col items-center text-center`}>
                
                {authorProfile && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--primary-color)]/50 shadow-[0_0_20px_var(--primary-glow)] mb-6">
                    <img decoding="async" loading="lazy" 
                      src={authorProfile.avatar_url || `https://ui-avatars.com/api/?name=${blog.author_name || 'Admin'}&background=random`} 
                      alt={blog.author_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <h3 className="text-[var(--text-color)] text-xl font-bold mb-2">
                  {authorProfile?.full_name || blog.author_name || 'Admin'}
                </h3>
                
                {/* Author ERP Details */}
                {authorProfile && (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <span className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--primary-color)]/20">
                      {authorProfile.role}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">
                      {authorProfile.role === 'student' ? authorProfile.programme : authorProfile.department}
                    </span>
                    {authorProfile.academic_batch && (
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                        Batch of {authorProfile.academic_batch}
                      </span>
                    )}
                  </div>
                )}
                
                {!authorProfile && guestAffiliation && (
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-4">
                    {guestAffiliation}
                  </span>
                )}

                <div className="w-full h-[1px] bg-[var(--card-border)] my-6"></div>

                <div className="w-full flex justify-between items-center text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Calendar size={14} className="text-[var(--primary-color)]"/> Published</span>
                  <span>{pubDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
