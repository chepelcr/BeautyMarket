import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function TransitionOverlay() {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevLocation, setPrevLocation] = useState(location);

  useEffect(() => {
    const homeRoutes = ['/', '/features', '/pricing', '/examples'];
    const instantHomeRoutes = ['/', '/features', '/pricing']; // No animation for these
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
    const otherFullPageRoutes = ['/organizations/new', '/organizations/select'];

    // Check if navigation is between home sections (scroll-based, no animation)
    // Excludes /examples which should have animation
    const isHomeSectionNav = (prev: string, curr: string) => {
      return instantHomeRoutes.includes(prev) && instantHomeRoutes.includes(curr);
    };

    // Check if navigation is between different layout types (home ↔ auth)
    const isLayoutSwitch = (prev: string, curr: string) => {
      const prevInHome = homeRoutes.includes(prev);
      const prevInAuth = authRoutes.includes(prev);
      const prevInOther = otherFullPageRoutes.includes(prev);

      const currInHome = homeRoutes.includes(curr);
      const currInAuth = authRoutes.includes(curr);
      const currInOther = otherFullPageRoutes.includes(curr);

      // True if switching between different layout groups
      return (
        (prevInHome && (currInAuth || currInOther)) ||
        (prevInAuth && (currInHome || currInOther)) ||
        (prevInOther && (currInHome || currInAuth))
      );
    };

    if (location !== prevLocation) {
      // Skip flash overlay for home section navigation
      if (isHomeSectionNav(prevLocation, location)) {
        setPrevLocation(location);
        return;
      }

      // Show flash for layout switches (home ↔ auth)
      if (isLayoutSwitch(prevLocation, location)) {
        setIsTransitioning(true);
        setPrevLocation(location);

        // Disable overlay after transition completes
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 1100); // Slightly longer than animation duration

        return () => clearTimeout(timer);
      } else {
        // Still update location but don't show transition for other cases
        setPrevLocation(location);
      }
    }
  }, [location, prevLocation]);

  return (
    <div
      className={`page-transition-overlay-root ${isTransitioning ? "active" : ""}`}
    />
  );
}
