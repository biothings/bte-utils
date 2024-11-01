import debug, { Debugger } from 'debug';
import async_hooks from 'async_hooks';

const debugInstances: {[namespace: string]: {[postfix: string]: Debugger}} = {};
const asyncContext = new Map();

async_hooks.createHook({
  init(asyncId, type, triggerAsyncId, resource) {
    if (asyncContext.has(triggerAsyncId)) {
      asyncContext.set(asyncId, asyncContext.get(triggerAsyncId));
    }
  },
  destroy(asyncId) {
    asyncContext.delete(asyncId);
  }
}).enable();

export function withDebugContext<F extends (...args: any[]) => any>(postfix: string, fn: F) {
  return async (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> => {
    const asyncId = async_hooks.executionAsyncId();
    asyncContext.set(asyncId, postfix);
    try {
      return await fn(...args);
    } finally {
      asyncContext.delete(asyncId);
    }
  };
}

function getContext() {
    const asyncId = async_hooks.executionAsyncId();
    return asyncContext.get(asyncId);
}

export function Debug(namespace: string) {
  debugInstances[namespace] = {'': debug(namespace)};
  return function(...args: Parameters<Debugger>) {
    if (!debugInstances[namespace][getContext() ?? '']) {
      debugInstances[namespace][getContext()] = debug(namespace + getContext());
    }
    debugInstances[namespace][getContext() ?? ''](...args);
  }
}