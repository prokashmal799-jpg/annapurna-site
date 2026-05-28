/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { MessageSquare, ThumbsUp, Send, CheckCircle2, User, Reply } from 'lucide-react';
import { Comment } from '../types';
import { fetchComments, addComment, incrementCommentLikes } from '../lib/dbSync';

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Initial load
  useEffect(() => {
    const loadComments = async () => {
      try {
        const fetched = await fetchComments();
        // Publicly we only display approved comments
        setComments(fetched.filter(c => c.approved));
      } catch (e) {
        console.error("Could not sync comments:", e);
      }
    };
    loadComments();

    // Re-listen on local storage changes for instantaneous local reactions
    const handleStorageChange = () => {
      loadComments();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim()) return;

    try {
      await addComment('news-global', authorName, commentText);
      setAuthorName('');
      setCommentText('');
      setSuccessMsg('ধন্যবাদ! আপনার মন্তব্যটি মডারেশনের জন্য পাঠানো হয়েছে। ক্যাবিনেট অ্যাপ্রুভ করলে এটি প্রদর্শিত হবে।');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      alert("মন্তব্য সেভ করতে ত্রুটি ঘটেছে।");
    }
  };

  const handleLike = async (id: string, isReply = false, parentId?: string) => {
    try {
      await incrementCommentLikes(id);
      setComments(prev => prev.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      await addComment('news-global', 'রিপ্লাই (ইউজার)', replyText);
      setReplyText('');
      setReplyTarget(null);
      setSuccessMsg('আপনার গুরুত্বপূর্ণ উত্তরটি মডারেশন কিউতে পাঠানো হয়েছে!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-orange-100 dark:border-slate-800 pb-4 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white font-bold shadow-md bg-gradient-to-tr from-red-600 to-orange-500">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
            জনসাধারণের জিজ্ঞাসা ও আলোচনা (Public Discussion Board)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            অন্নপূর্ণা ভান্ডার প্রকল্প নিয়ে যেকোনো প্রশ্ন করুন, অভিজ্ঞরা আপনার প্রশ্নের উত্তর দেবেন
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="mb-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="h-4.5 w-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Write Comment Form */}
      <form onSubmit={handlePostComment} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl mb-8 border border-orange-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
          আপনার কোনো প্রশ্ন থাকলে নিচে লিখুন:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="আপনার নাম (Name)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-gray-900 dark:text-white font-semibold"
              required
            />
          </div>
          <div className="md:col-span-8 flex gap-2">
            <input
              type="text"
              placeholder="আপনার প্রশ্ন বা মতামত এখানে লিখুন..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-gray-900 dark:text-white"
              required
            />
            <button
              id="submit-comment-btn"
              type="submit"
              className="px-5 rounded-lg bg-orange-600 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 hover:bg-orange-605 transition cursor-pointer active:scale-95"
            >
              <span>পাঠান</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Comments List Container */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-150 dark:border-slate-850 pb-5 last:border-none last:pb-0">
            {/* Primary Comment Box */}
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-slate-800 dark:text-orange-400">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-850 dark:text-white">
                      {comment.author}
                    </span>
                    {comment.author.includes('অ্যাডমিন') && (
                      <span className="inline-flex rounded-full bg-red-100 text-[9px] font-black text-red-800 px-1.5 py-0.5 uppercase tracking-tight">Verified</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{comment.date}</span>
                </div>
                <p className="mt-1.5 text-xs text-gray-750 dark:text-gray-350 leading-relaxed">
                  {comment.content}
                </p>

                {/* Micro Actions */}
                <div className="mt-2.5 flex items-center gap-4">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-orange-600 cursor-pointer"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>লাইক ({comment.likes})</span>
                  </button>
                  <button
                    onClick={() => setReplyTarget(replyTarget === comment.id ? null : comment.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-orange-600 cursor-pointer"
                  >
                    <Reply className="h-3.5 w-3.5" />
                    <span>উত্তর দিন</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Replies Board */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pl-12 space-y-4 border-l border-gray-200 dark:border-slate-850 ml-4.5">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-slate-800">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-orange-100">
                          {reply.author}
                        </span>
                        {reply.author.includes('অ্যাডমিন') && (
                          <span className="bg-red-500 text-white font-black text-[8px] px-1 py-0.1 select-none rounded-full">ADMIN</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {reply.content}
                      </p>
                      <div className="mt-1">
                        <button
                          onClick={() => handleLike(reply.id, true, comment.id)}
                          className="flex items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-orange-500 cursor-pointer"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>লাইক ({reply.likes})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline reply composer */}
            {replyTarget === comment.id && (
              <div className="mt-4 pl-12 ml-4.5 flex gap-2">
                <input
                  type="text"
                  placeholder="আপনার উত্তর লিখুন..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 py-2 px-3 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => handlePostReply(comment.id)}
                  className="rounded-lg bg-slate-900 text-white px-4 text-xs font-bold"
                >
                  উত্তর পাঠান
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
