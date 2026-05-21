const DEFAULT_BENCHMARK_DURATION_MS = 10000;
const MIN_BENCHMARK_DURATION_MS = 3000;

export function getBenchmarkDurationMs() {
  const configuredValue = new URLSearchParams(window.location.search).get('benchmarkMs');
  const duration = Number(configuredValue);

  if (!Number.isFinite(duration) || duration < MIN_BENCHMARK_DURATION_MS) {
    return DEFAULT_BENCHMARK_DURATION_MS;
  }

  return duration;
}

