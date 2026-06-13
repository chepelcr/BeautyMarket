import { useEffect, useRef, useState } from "react";

interface PageTransitionProps {
  children: (displayLocation: string, transitionStage: string, isLayoutSwitch: boolean) => React.ReactNode;
  location: string;
}

export function PageTransition({ children, location }: PageTransitionProps) {
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("page-enter");
  const [isLayoutSwitch, setIsLayoutSwitch] = useState(false);
  const prevLocationRef = useRef(location);

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

    if (location !== prevLocationRef.current) {
      // Skip animation for home section navigation (scroll-based)
      if (isHomeSectionNav(prevLocationRef.current, location)) {
        setDisplayLocation(location);
        setTransitionStage("page-enter");
        setIsLayoutSwitch(false);
        prevLocationRef.current = location;
        return;
      }

      const isSwitch = isLayoutSwitch(prevLocationRef.current, location);
      setIsLayoutSwitch(isSwitch);

      // Animate for all other cases
      setTransitionStage("page-exit");

      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("page-enter");
        prevLocationRef.current = location;
      }, 500);

      // Reset layout switch flag after animation completes
      const resetTimer = setTimeout(() => {
        setIsLayoutSwitch(false);
      }, 1100); // Slightly longer than total animation duration (500 + 550)

      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [location]);

  return (
    <div>
      {children(displayLocation, transitionStage, isLayoutSwitch)}
    </div>
  );
}
