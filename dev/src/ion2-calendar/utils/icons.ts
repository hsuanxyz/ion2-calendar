const getIconMap = (): Map<string, string> => {
  if (typeof window === 'undefined') {
    return new Map();
  } else {
      const win = window as any;
      win.Ionicons = win.Ionicons || {};
      win.Ionicons.map = win.Ionicons.map || new Map();
    return win.Ionicons.map;
  }
};

export const isIonIconsV4 = (): boolean => {
  const iconMap = getIconMap();
  return !!iconMap.get('md-arrow-dropdown');
};
