
type RefreshCallback = () => void;

let refreshCallbacks: Set<RefreshCallback> = new Set();


export function registerRefreshCallback(callback: RefreshCallback): () => void {
  refreshCallbacks.add(callback);
  
  return () => {
    refreshCallbacks.delete(callback);
  };
}

export function triggerRefresh(): void {
  refreshCallbacks.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      console.error('Error al ejecutar callback de refresh:', error);
    }
  });
}

