import debug, { Debugger } from 'debug';
import { AsyncLocalStorage } from 'node:async_hooks';

const debugInstances: {[namespace: string]: {[postfix: string]: Debugger}} = {};
const asyncLocalStorage = new AsyncLocalStorage<{postfix: string}>();

export function withDebugContext<F extends (...args: any[]) => any>(postfix: string, fn: F) {
  return async (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> => {
    return await asyncLocalStorage.run({ postfix }, () => {
      return fn(...args);
    })
  };
}

function getContext() {
  return asyncLocalStorage.getStore()?.postfix;
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