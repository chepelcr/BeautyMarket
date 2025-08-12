import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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

  const getSectionStyles = (section: string) => {
    const backgroundColor = getContent(section, 'background_color', '#ffffff');
    return {
      backgroundColor,
    };
  };

  const getButtonStyles = (section: string) => {
    const buttonColor = getContent(section, 'cta_color', '#ec4899');
    return {
      backgroundColor: buttonColor,
    };
  };

  return {
    content,
    isLoading,
    error,
    getContent,
    getSectionStyles,
    getButtonStyles,
    rawContent
  };
}