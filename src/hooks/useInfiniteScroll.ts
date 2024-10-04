// src/hooks/useInfiniteScroll.ts
import { useCallback, useRef } from "react";

export const useInfiniteScroll = (
  loading: boolean,
  hasMore: boolean,
  loadMore: () => void,
) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore],
  );

  return lastElementRef;
};
