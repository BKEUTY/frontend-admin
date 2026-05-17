import { lazy } from 'react';

export const safeLazy = (importFunc) => {
  return lazy(async () => {
    try {
      const component = await importFunc();
      sessionStorage.removeItem('admin-chunk-reload-occurred');
      return component;
    } catch (error) {
      const isChunkError = 
        error.message.includes('Failed to fetch') ||
        error.message.includes('dynamically imported') ||
        error.message.includes('Loading chunk') ||
        error.message.includes('chunk') ||
        error.name === 'TypeError';

      if (isChunkError) {
        const hasReloaded = sessionStorage.getItem('admin-chunk-reload-occurred');
        if (!hasReloaded) {
          sessionStorage.setItem('admin-chunk-reload-occurred', 'true');
          window.location.reload();
          return new Promise(() => {});
        }
      }
      throw error;
    }
  });
};
