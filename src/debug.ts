import debug, { Debugger } from 'debug';
import async_hooks from 'async_hooks';

const debugInstances: {[namespace: string]: {[postfix: string]: Debugger}} = {};
const asyncContext = new Map();

// any child async calls/promises will inherit the asyncContex from their parent (triggerAsyncId)
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
    // associates the promise created by this function with the postfix to be added to the debug namespace
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
  // debug instances are organized by postfix to the namespace (default is no postfix)
  debugInstances[namespace] = {'': debug(namespace)};
  return function(...args: Parameters<Debugger>) {
    // getContext gives the postfix to the namespace (create new debug instance if we don't have one yet)
    if (!debugInstances[namespace][getContext() ?? '']) {
      debugInstances[namespace][getContext()] = debug(namespace + getContext());
    }
    debugInstances[namespace][getContext() ?? ''](...args);
  }
}