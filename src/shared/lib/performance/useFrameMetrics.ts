import { useEffect, useRef, useState } from 'react';

export type FrameMetrics = {
  fps: number;
  averageFrameMs: number;
  maxFrameMs: number;
  droppedFrames: number;
};

const FRAME_HISTORY_LIMIT = 60;
const DROPPED_FRAME_THRESHOLD_MS = 1000 / 30;
const METRICS_UPDATE_INTERVAL_MS = 500;

export function useFrameMetrics(): FrameMetrics {
  const [metrics, setMetrics] = useState<FrameMetrics>({
    fps: 60,
    averageFrameMs: 16.7,
    maxFrameMs: 16.7,
    droppedFrames: 0,
  });
  const frameTimes = useRef<number[]>([]);

  useEffect(() => {
    let frameHandle = 0;
    let lastTime = performance.now();
    let lastMetricsUpdate = lastTime;

    const measureFrame = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      const nextFrameTimes = [...frameTimes.current.slice(-(FRAME_HISTORY_LIMIT - 1)), delta];
      frameTimes.current = nextFrameTimes;

      if (time - lastMetricsUpdate >= METRICS_UPDATE_INTERVAL_MS) {
        lastMetricsUpdate = time;

        const averageFrameMs = nextFrameTimes.reduce((sum, value) => sum + value, 0) / nextFrameTimes.length;
        const maxFrameMs = Math.max(...nextFrameTimes);
        const droppedFrames = nextFrameTimes.filter((value) => value > DROPPED_FRAME_THRESHOLD_MS).length;

        setMetrics({
          fps: Math.round(1000 / averageFrameMs),
          averageFrameMs: Number(averageFrameMs.toFixed(1)),
          maxFrameMs: Number(maxFrameMs.toFixed(1)),
          droppedFrames,
        });
      }

      frameHandle = requestAnimationFrame(measureFrame);
    };

    frameHandle = requestAnimationFrame(measureFrame);

    return () => cancelAnimationFrame(frameHandle);
  }, []);

  return metrics;
}
