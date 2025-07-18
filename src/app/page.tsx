
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Clock, MessageSquarePlus, Layers, Zap, Users, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useOnScreen } from '@/hooks/use-on-screen';
import { cn } from '@/lib/utils';

const AnimatedFeatureCard = ({ icon: Icon, title, description, className, animationDelay = 0 }: { icon: React.ElementType, title: string, description: string, className?: string, animationDelay?: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    return (
        <div ref={ref} className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{transitionDelay: `${animationDelay}ms`}}>
            <Card className={`bg-card border p-6 text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl ${className}`}>
                <CardContent className="p-0">
                    <div className="mx-auto bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold font-headline mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        </div>
    );
};

const AnimatedListItem = ({ icon: Icon, title, description, animationDelay = 0 }: { icon: React.ElementType, title: string, description: string, animationDelay?: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    return (
        <div ref={ref} className={cn("flex items-start gap-4 transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{transitionDelay: `${animationDelay}ms`}}>
            <div className="flex-shrink-0 bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold mb-1">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    );
};


const AnimatedSection = ({ children, className, animationDelay = 0, as: Comp = 'div' }: { children: React.ReactNode, className?: string, animationDelay?: number, as?: React.ElementType }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);
  
    return (
      <Comp
        ref={ref}
        className={cn(
          "transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          className
        )}
        style={{ transitionDelay: `${animationDelay}ms` }}
      >
        {children}
      </Comp>
    );
  };

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (window.location.pathname === '/dashboard' && !user) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <AnimatedSection as="header" className="p-4 flex justify-between items-center max-w-7xl mx-auto absolute top-0 left-0 right-0 z-10 bg-transparent">
            <div className="flex items-center gap-3">
          <Link href="/" className="mr-6 flex items-center space-x-2"> <img src='/images/TechezLogo.png' width={40}></img>
            <span className="minecraftFont pt-2 text-2xl font-medium">TECHEZ</span>
          </Link>
      </div>
            <div>
            <Button asChild variant="ghost" className="mr-2">
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/login">Try For Free</Link>
            </Button>
            </div>
      </AnimatedSection>

      <main>
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center text-center py-20 px-4">
          <AnimatedSection>
            <h1 className="text-5xl md:text-7xl font-bold font-headline mb-4 tracking-tighter" style={{fontWeight: 700}}>
              Your Leads, One Powerful Space
            </h1>
            <AnimatedSection animationDelay={200}>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Track, convert, and grow – without the chaos. From the makers at Techez.
              </p>
            </AnimatedSection>
             <AnimatedSection animationDelay={400}>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg py-7 px-8">
                    <Link href="/login">Try Leader Free</Link>
                </Button>
            </AnimatedSection>
          </AnimatedSection>
        </section>

        {/* Why Leader Section */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-6xl mx-auto">
             <AnimatedSection>
                <h2 className="text-center text-4xl font-bold font-headline mb-12">Why Leader?</h2>
             </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedFeatureCard 
                  icon={Zap} 
                  title="Built for Speed"
                  description="A fast, intuitive dashboard that keeps your workflow moving."
                  animationDelay={200}
              />
              <AnimatedFeatureCard 
                  icon={Users} 
                  title="Team-Centric"
                  description="Seamless visibility for everyone, from sales reps to managers."
                  animationDelay={400}
              />
              <AnimatedFeatureCard 
                  icon={ShieldCheck} 
                  title="Secure by Design"
                  description="Your data is yours. We ensure it stays that way, always."
                  animationDelay={600}
              />
            </div>
          </div>
        </section>

        {/* What You Can Do Section */}
         <section className="py-20 px-4 max-w-5xl mx-auto">
            <AnimatedSection>
                <h2 className="text-center text-4xl font-bold font-headline mb-12">What You Can Do</h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                <AnimatedListItem
                    icon={BarChart}
                    title="Track Lead Status"
                    description="Move leads from 'New' to 'Converted' on a clean, visual dashboard."
                    animationDelay={200}
                />
                <AnimatedListItem
                    icon={Clock}
                    title="Schedule Follow-Ups"
                    description="Set reminders so you never miss a chance to connect."
                    animationDelay={400}
                />
                <AnimatedListItem
                    icon={MessageSquarePlus}
                    title="Add Team Notes"
                    description="Keep everyone aligned with quick, contextual notes on every lead."
                    animationDelay={600}
                />
                <AnimatedListItem
                    icon={Layers}
                    title="Organize Everything"
                    description="Store all lead data in one central hub for total clarity."
                    animationDelay={800}
                />
            </div>
         </section>
        
        {/* Visual Demo Section */}
        <section className="py-20 px-4">
            <AnimatedSection>
                <div className="relative max-w-5xl mx-auto p-8 bg-card rounded-2xl shadow-xl overflow-hidden">
                    <h3 className="text-center text-3xl font-bold font-headline mb-8">Clarity in a Single View</h3>
                    <div className="relative p-4 rounded-lg">
                        <Image 
                            src="https://placehold.co/1200x600.png"
                            alt="Leader Dashboard Preview"
                            width={1200}
                            height={600}
                            className="rounded-xl border shadow-lg"
                            data-ai-hint="dashboard user interface"
                        />
                    </div>
                </div>
            </AnimatedSection>
        </section>

        {/* Built for... Section */}
        <section className="py-20 px-4 text-center">
            <AnimatedSection>
                <h2 className="text-3xl font-bold font-headline mb-2">Built for Teams That Value...</h2>
            </AnimatedSection>
             <AnimatedSection animationDelay={200}>
                <p className="text-lg text-muted-foreground mb-8">Focus. Speed. Growth.</p>
             </AnimatedSection>
            <AnimatedSection animationDelay={400}>
                <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-4 md:gap-8">
                <div className="bg-secondary p-4 rounded-lg font-medium text-sm md:text-base">Productivity Over Paperwork</div>
                <div className="bg-secondary p-4 rounded-lg font-medium text-sm md:text-base">Clarity Over Chaos</div>
                <div className="bg-secondary p-4 rounded-lg font-medium text-sm md:text-base">Conversion Over Complexity</div>
                </div>
            </AnimatedSection>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold font-headline mb-4">Get Your Own Leader</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact us to get started with a personalized setup for your team.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-lg">
              <a href="mailto:contact.techez@gmail.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                <Mail className="w-6 h-6 text-primary" />
                <span>contact.techez@gmail.com</span>
              </a>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <a href="tel:+918320495754" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <Phone className="w-6 h-6 text-primary" />
                  <span>+91 83204 95754</span>
                </a>
                <a href="tel:+919313672805" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <Phone className="w-6 h-6 text-primary" />
                  <span>+91 93136 72805</span>
                </a>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 bg-secondary">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Leads are better with Leader.</h2>
             <AnimatedSection animationDelay={200}>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg py-7 px-8 mb-4">
                    <Link href="/login">Get Started for Free</Link>
                </Button>
             </AnimatedSection>
            <AnimatedSection animationDelay={400}>
                <p className="text-muted-foreground">Zero clutter. Just clarity.</p>
            </AnimatedSection>
          </AnimatedSection>
        </section>
      </main>

      {/* Footer */}
      <AnimatedSection as="footer" className="text-center p-8 text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Techez Inc. All rights reserved.</p>
      </AnimatedSection>
    </div>
  );
}
