import { ReactNode } from 'react';

/**
 * Parse title with line breaks and color highlighting
 * 
 * Syntax:
 * - Use \n for line breaks
 * - Use {{text}} for primary color
 * - Use [[text]] for accent color
 * - Use ((text)) for success color
 * - Use <<text>> for warning color
 * 
 * Examples:
 * - "Line 1\nLine 2" → Two lines
 * - "Normal {{highlighted}}" → "highlighted" in primary color
 * - "First line\n{{Second line}}" → Two lines, second in primary color
 */

type ColorType = 'primary' | 'accent' | 'success' | 'warning';

interface TextSegment {
  text: string;
  color?: ColorType;
}

const COLOR_PATTERNS: Array<{ regex: RegExp; color: ColorType }> = [
  { regex: /\{\{([^}]+)\}\}/g, color: 'primary' },
  { regex: /\[\[([^\]]+)\]\]/g, color: 'accent' },
  { regex: /\(\(([^)]+)\)\)/g, color: 'success' },
  { regex: /<<([^>]+)>>/g, color: 'warning' },
];

function parseLineSegments(line: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = line;
  let lastIndex = 0;

  // Find all color patterns in the line
  const matches: Array<{ index: number; length: number; text: string; color: ColorType }> = [];
  
  COLOR_PATTERNS.forEach(({ regex, color }) => {
    const lineMatches = [...remaining.matchAll(regex)];
    lineMatches.forEach(match => {
      if (match.index !== undefined) {
        matches.push({
          index: match.index,
          length: match[0].length,
          text: match[1],
          color,
        });
      }
    });
  });

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Build segments
  matches.forEach(match => {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = remaining.substring(lastIndex, match.index);
      if (beforeText) {
        segments.push({ text: beforeText });
      }
    }
    // Add colored segment
    segments.push({ text: match.text, color: match.color });
    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < remaining.length) {
    const afterText = remaining.substring(lastIndex);
    if (afterText) {
      segments.push({ text: afterText });
    }
  }

  // If no matches found, return the whole line
  if (segments.length === 0) {
    segments.push({ text: line });
  }

  return segments;
}

const COLOR_CLASSES: Record<ColorType, string> = {
  primary: 'text-primary',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
};

export function parseTitle(title: string, className?: string): ReactNode {
  // Split by line breaks
  const lines = title.split('\\n');

  if (lines.length === 1) {
    // Single line - parse color segments
    const segments = parseLineSegments(lines[0]);
    
    if (segments.length === 1 && !segments[0].color) {
      // No special formatting
      return title;
    }

    return (
      <>
        {segments.map((segment, i) => (
          segment.color ? (
            <span key={i} className={COLOR_CLASSES[segment.color]}>
              {segment.text}
            </span>
          ) : (
            <span key={i}>{segment.text}</span>
          )
        ))}
      </>
    );
  }

  // Multiple lines
  return (
    <>
      {lines.map((line, lineIndex) => {
        const segments = parseLineSegments(line);
        const isLastLine = lineIndex === lines.length - 1;

        return (
          <span key={lineIndex} className={className}>
            {segments.map((segment, segIndex) => (
              segment.color ? (
                <span key={segIndex} className={COLOR_CLASSES[segment.color]}>
                  {segment.text}
                </span>
              ) : (
                <span key={segIndex}>{segment.text}</span>
              )
            ))}
            {!isLastLine && <br />}
          </span>
        );
      })}
    </>
  );
}

/**
 * Helper to render a title with parseTitle
 */
export function Title({ 
  text, 
  as: Component = 'h2', 
  className = '' 
}: { 
  text: string; 
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; 
  className?: string;
}) {
  return (
    <Component className={className}>
      {parseTitle(text)}
    </Component>
  );
}
