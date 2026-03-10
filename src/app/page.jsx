import AboutSection from "@/components/home/AboutSection";
import CoursesSection from "@/components/home/CourseSection";
import HeroSection from "@/components/home/HeroSection";
import LeadershipSection from "@/components/home/LederShipSection";
import TestimonialsSection from "@/components/home/TestimonalsSection";

export default function page() {
  return (
    <div>
      <HeroSection/>
      <AboutSection/>
      <CoursesSection/>
      <LeadershipSection/>
      <TestimonialsSection/>
    </div>
  );
}