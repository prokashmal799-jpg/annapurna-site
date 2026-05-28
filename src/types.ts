/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TabId = 
  | 'home' 
  | 'eligibility' 
  | 'apply' 
  | 'status' 
  | 'documents' 
  | 'news' 
  | 'faq' 
  | 'contact'
  | 'about' 
  | 'privacy' 
  | 'terms' 
  | 'disclaimer'
  | 'admin'
  | 'form_filler';

export interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  image: string;
  views: number;
  slug?: string;
  published?: boolean;
  scheduledAt?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
  approved?: boolean;
}

export interface AdSetting {
  id: string;
  type: 'leaderboard' | 'rectangle' | 'sidebar' | 'responsive';
  location: string;
  title: string;
  ctaText: string;
  linkUrl: string;
  imageUrl?: string;
  active?: boolean;
  code?: string;
}

export interface ContactSetting {
  id: string;
  phone: string;
  phoneSubtext: string;
  email: string;
  address: string;
  warning: string;
}

export interface Subscriber {
  id: string;
  userAgent: string;
  permission: string;
  createdAt: string;
  lastActive?: string;
  language?: string;
}

export interface PushCampaign {
  id: string;
  title: string;
  body: string;
  link: string;
  icon: string;
  createdAt: string;
  sentBy?: string;
  active?: boolean;
}

