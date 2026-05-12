import { ReactNode, useEffect, useState } from 'react';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { Icon } from '@/components/ui/Icon';

interface AutoTranslateWrapperProps {
  children: ReactNode;
  sourceData: any;
  targetData: any;
  sourceLang: 'es' | 'en';
  targetLang: 'es' | 'en';
  onTranslated?: (translatedData: any) => void;
  enabled?: boolean;
}

/**
 * Wrapper component that auto-translates missing content when switching languages
 * Shows a translation indicator while processing
 */
export function AutoTranslateWrapper({
  children,
  sourceData,
  targetData,
  sourceLang,
  targetLang,
  onTranslated,
  enabled = true,
}: AutoTranslateWrapperProps) {
  const { translateObject, isAvailable, isLoading, isReady } = useAutoTranslate({
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    enabled,
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Check if target data is missing or empty
    const needsTranslation = !targetData || 
      (typeof targetData === 'object' && Object.keys(targetData).length === 0) ||
      (Array.isArray(targetData) && targetData.length === 0);

    if (needsTranslation && sourceData && isReady && enabled) {
      setIsTranslating(true);
      setShowNotice(true);

      translateObject(sourceData)
        .then((translated) => {
          if (onTranslated) {
            onTranslated(translated);
          }
          setIsTranslating(false);
          // Keep notice visible for 2 seconds
          setTimeout(() => setShowNotice(false), 2000);
        })
        .catch((error) => {
          console.error('Auto-translation failed:', error);
          setIsTranslating(false);
          setShowNotice(false);
        });
    }
  }, [sourceData, targetData, isReady, enabled, translateObject, onTranslated]);

  return (
    <div className="relative">
      {/* Translation notice */}
      {showNotice && isAvailable && (
        <div className="mb-4 p-3 rounded-lg bg-info/10 border border-info/30 flex items-center gap-2">
          <Icon name="Languages" size={16} className="text-info shrink-0" />
          <div className="flex-1 text-sm">
            {isTranslating ? (
              <span className="text-info font-medium">
                Auto-translating from {sourceLang.toUpperCase()} to {targetLang.toUpperCase()}...
              </span>
            ) : (
              <span className="text-info font-medium">
                ✓ Auto-translated from {sourceLang.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* API not available notice */}
      {!isAvailable && enabled && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2">
          <Icon name="AlertCircle" size={16} className="text-warning shrink-0" />
          <div className="flex-1 text-sm text-warning">
            <strong>Translation API not available.</strong> Please add {targetLang.toUpperCase()} content manually.
            <br />
            <span className="text-xs opacity-75">
              (Requires Chrome 130+ or Edge 130+ with AI features enabled)
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
