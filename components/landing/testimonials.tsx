"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Engineering Student",
    image:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop",
    quote:
      "The AI teaching platform helped me understand complex engineering concepts that I was struggling with. The whiteboard explanations are incredibly intuitive!",
  },
  {
    name: "Sarah Chen",
    role: "Math Tutor",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    quote:
      "I recommend this to all my students. The way the AI breaks down mathematical problems step-by-step on the whiteboard has improved my students' understanding significantly.",
  },
  {
    name: "Michael Rodriguez",
    role: "Physics PhD Student",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    quote:
      "The interactive nature of the platform makes learning quantum mechanics less intimidating. Being able to ask questions during the AI's explanations has been invaluable.",
  },
  {
    name: "Emily Wilson",
    role: "Medical Student",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    quote:
      "Studying anatomy became much easier with the AI's visual explanations. The platform helped me prepare for my exams more effectively than traditional methods.",
  },
  {
    name: "David Park",
    role: "Computer Science Major",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    quote:
      "Learning algorithms is challenging, but the AI's whiteboard demonstrations and ability to answer my specific questions made the concepts click for me.",
  },
  {
    name: "Olivia Taylor",
    role: "High School Teacher",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    quote:
      "I've integrated this platform into my teaching methods, and my students love it. It's like having an additional expert teacher in the classroom.",
  },
];

export default function Testimonials() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side render that matches initial client render
  if (!mounted) {
    return (
      <section className="w-full py-24" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who have transformed their learning
              experience with our AI teaching platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl border border-foreground/5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                    {/* Skip image during server-side rendering */}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-current text-amber-400"
                    />
                  ))}
                </div>

                <blockquote className="text-muted-foreground italic flex-1">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
              <span className="text-primary">4.9/5</span> average rating from
              over 2,000 users
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-24" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who have transformed their learning
            experience with our AI teaching platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border border-foreground/5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current text-amber-400"
                  />
                ))}
              </div>

              <blockquote className="text-muted-foreground italic flex-1">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
            <span className="text-primary">4.9/5</span> average rating from over
            2,000 users
          </div>
        </div>
      </div>
    </section>
  );
}
