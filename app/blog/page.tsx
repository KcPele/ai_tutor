"use client";

import ClientNavbar from "@/components/client-navbar";
import ClientFooter from "@/components/client-footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Filter,
  Search,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Sample blog data
const BLOG_POSTS = [
  {
    id: 1,
    title: "How AI is Revolutionizing the Way We Learn",
    excerpt:
      "AI technology is transforming education, making learning more personalized and accessible than ever before.",
    category: "Education",
    author: "Dr. Emma Rodriguez",
    authorRole: "Education Specialist",
    date: "May 15, 2023",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1593376893114-9f4b07e5f602?q=80&w=800&auto=format&fit=crop",
    tags: ["AI", "Education", "Technology"],
  },
  {
    id: 2,
    title: "The Power of Personalized Learning Paths",
    excerpt:
      "Discover how customized learning journeys can improve knowledge retention and student engagement.",
    category: "Learning",
    author: "Prof. Michael Chang",
    authorRole: "Learning Scientist",
    date: "June 2, 2023",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop",
    tags: ["Personalization", "Learning", "Student Success"],
  },
  {
    id: 3,
    title: "Bridging Knowledge Gaps with AI Tutoring",
    excerpt:
      "How AI-powered tutoring systems are helping students fill gaps in their understanding like never before.",
    category: "Technology",
    author: "Sarah Johnson",
    authorRole: "AI Product Manager",
    date: "July 10, 2023",
    readTime: "10 min read",
    image:
      "https://images.unsplash.com/photo-1581089781785-603411fa81e5?q=80&w=800&auto=format&fit=crop",
    tags: ["AI Tutoring", "EdTech", "Knowledge Gaps"],
  },
  {
    id: 4,
    title: "The Future of AI in Academic Research",
    excerpt:
      "Exploring how artificial intelligence is transforming research methodologies across academic disciplines.",
    category: "Research",
    author: "Dr. James Wilson",
    authorRole: "Research Director",
    date: "August 8, 2023",
    readTime: "12 min read",
    image:
      "https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?q=80&w=800&auto=format&fit=crop",
    tags: ["Academic Research", "AI Innovation", "Future of Learning"],
  },
  {
    id: 5,
    title: "Balancing Technology and Human Connection in Education",
    excerpt:
      "Finding the sweet spot between technological innovation and maintaining meaningful human relationships in learning.",
    category: "Education",
    author: "Olivia Martinez",
    authorRole: "Educational Psychologist",
    date: "September 5, 2023",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
    tags: ["Human Connection", "EdTech Balance", "Teaching"],
  },
  {
    id: 6,
    title: "How to Make the Most of AI Learning Tools",
    excerpt:
      "Practical tips for students and educators to leverage AI-powered learning platforms effectively.",
    category: "Tips & Tricks",
    author: "Alex Thompson",
    authorRole: "Educational Technologist",
    date: "October 12, 2023",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
    tags: ["Learning Tools", "Productivity", "Student Tips"],
  },
];

const categories = [
  "All",
  "Education",
  "Technology",
  "Learning",
  "Research",
  "Tips & Tricks",
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter blog posts based on category and search query
  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <ClientNavbar />

      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 dark:bg-grid-small-white bg-grid-small-black -z-10 opacity-[0.2]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Our{" "}
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                Blog
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Insights, updates, and stories about AI-powered learning and the
              future of education
            </motion.p>

            {/* Search bar */}
            <motion.div
              className="relative max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full px-4 py-3 pl-10 rounded-full bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <Filter className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm text-muted-foreground mr-2">Filter by:</span>
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                className="group flex flex-col h-full overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-medium bg-primary/90 text-primary-foreground">
                    {post.category}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{post.date}</span>
                    <span className="text-muted-foreground">•</span>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{post.readTime}</span>
                  </div>

                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h2>

                  <p className="text-muted-foreground mb-4 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center text-xs rounded-full px-2.5 py-0.5 bg-secondary text-secondary-foreground"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center mt-auto pt-4 border-t">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{post.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {post.authorRole}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any articles matching your search criteria.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600/20 to-violet-600/20 dark:from-blue-800/30 dark:to-violet-800/30 p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Stay up to date
            </h2>
            <p className="text-muted-foreground mb-6">
              Get notified when we publish new articles and updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button className="whitespace-nowrap">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <ClientFooter />
    </div>
  );
}
