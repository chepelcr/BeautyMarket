export interface BackgroundData {
  type: 'color' | 'gradient' | 'image';
  mode?: 'both' | 'light' | 'dark';
  value?: string; // for color type
  gradient?: {
    from: string;
    to: string;
    direction: string;
  };
  image?: {
    url: string;
    opacity: number;
  };
}

export function parseBackgroundValue(value: string): BackgroundData | null {
  if (!value) return null;
  
  try {
    return JSON.parse(value);
  } catch (e) {
    // Fallback for simple color values
    return {
      type: 'color',
      mode: 'both',
      value: value
    };
  }
}

export function generateBackgroundStyle(bgValue: string, isDark: boolean = false): React.CSSProperties {
  const bgData = parseBackgroundValue(bgValue);
  if (!bgData) return {};
  
  // Check mode compatibility
  if (bgData.mode === 'light' && isDark) return {};
  if (bgData.mode === 'dark' && !isDark) return {};
  
  switch (bgData.type) {
    case 'color':
      // Handle dual-mode colors for "Ambos modos"
      if (bgData.mode === 'both' && (bgData.lightValue || bgData.darkValue)) {
        const color = isDark 
          ? (bgData.darkValue || bgData.value || '#000000') 
          : (bgData.lightValue || bgData.value || '#ffffff');
        return { backgroundColor: color };
      }
      return { backgroundColor: bgData.value };
      
    case 'gradient':
      if (!bgData.gradient) return {};
      
      // Handle dual-mode gradients for "Ambos modos"
      let gradient;
      if (bgData.mode === 'both') {
        if (isDark && bgData.darkGradient) {
          gradient = bgData.darkGradient;
        } else if (!isDark && bgData.lightGradient) {
          gradient = bgData.lightGradient;
        } else {
          gradient = bgData.gradient;
        }
      } else {
        gradient = bgData.gradient;
      }
      
      const { from, to, direction } = gradient;
      if (direction === 'radial') {
        return { background: `radial-gradient(circle, ${from}, ${to})` };
      } else {
        return { background: `linear-gradient(${direction}, ${from}, ${to})` };
      }
      
    case 'image':
      if (!bgData.image) return {};
      const { url, opacity } = bgData.image;
      return {
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: opacity || 1
      };
      
    default:
      return {};
  }
}

export function generateBackgroundClass(bgValue: string, isDark: boolean = false): string {
  const bgData = parseBackgroundValue(bgValue);
  if (!bgData) return '';
  
  // Check mode compatibility
  if (bgData.mode === 'light' && isDark) return '';
  if (bgData.mode === 'dark' && !isDark) return '';
  
  switch (bgData.type) {
    case 'gradient':
      if (!bgData.gradient) return '';
      const { direction } = bgData.gradient;
      return `bg-gradient-${direction}`;
      
    default:
      return '';
  }
}