import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { generateBackgroundStyle } from "@/utils/background-styles";

export interface CmsContent {
  id: string;
  section: string;
  key: string;
  value: string;
  type: string;
  displayName: string;
  description?: string;
  sortOrder: number;
}

export interface CmsContentMap {
  [section: string]: {
    [key: string]: string;
  };
}

export function useCmsContent() {
  const { data: rawContent, isLoading, error } = useQuery<CmsContent[]>({
    queryKey: ["/api/home-content"],
  });

  const content = useMemo(() => {
    if (!rawContent || !Array.isArray(rawContent)) return {};
    
    return rawContent.reduce((acc: CmsContentMap, item: CmsContent) => {
      if (!acc[item.section]) {
        acc[item.section] = {};
      }
      acc[item.section][item.key] = item.value;
      return acc;
    }, {} as CmsContentMap);
  }, [rawContent]);

  const getContent = (section: string, key: string, defaultValue = '') => {
    return content[section]?.[key] || defaultValue;
  };

  const getSectionStyles = (section: string, key: string = 'backgroundStyle') => {
    const bgValue = getContent(section, key);
    if (!bgValue) return {};
    
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const styles = generateBackgroundStyle(bgValue, isDark);
    
    // Add debugging
    if (section === 'categories') {
      console.log('Categories background:', { bgValue, isDark, styles });
    }
    
    return styles;
  };

  const getButtonStyles = (section: string) => {
    const buttonColor = getContent(section, 'cta_color', '#ec4899');
    return {
      backgroundColor: buttonColor,
    };
  };

  const getTextStyles = (section: string, type: 'title' | 'subtitle' = 'title') => {
    const colorKey = `${type}_color`;
    const textColor = getContent(section, colorKey);
    if (!textColor) return {};
    
    // Check if it's a JSON color configuration (dual-mode support)
    try {
      const colorData = JSON.parse(textColor);
      if (colorData && typeof colorData === 'object') {
        const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
        
        // Handle dual-mode colors
        if (colorData.mode === 'both') {
          const color = isDark 
            ? (colorData.darkValue || colorData.value || '#000000') 
            : (colorData.lightValue || colorData.value || '#000000');
          return { 
            color: `${color} !important`,
            '--text-color': color 
          };
        }
        
        // Handle single-mode colors
        if (colorData.mode === 'single') {
          return { 
            color: `${colorData.value || '#000000'} !important`,
            '--text-color': colorData.value || '#000000'
          };
        }
        
        // Default single color
        return { 
          color: `${colorData.value || textColor} !important`,
          '--text-color': colorData.value || textColor
        };
      }
    } catch {
      // Not JSON, treat as regular color string
    }
    
    return {
      color: `${textColor} !important`,
      '--text-color': textColor
    };
  };

  return {
    content,
    isLoading,
    error,
    getContent,
    getSectionStyles,
    getButtonStyles,
    getTextStyles,
    rawContent
  };
}