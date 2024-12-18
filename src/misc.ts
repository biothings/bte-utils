import lockfile from "proper-lockfile";

export function toArray<Type>(input: Type | Type[]): Type[] {
  if (Array.isArray(input)) {
    return input;
  }
  return [input];
}

export function getUnique<Type>(input: Type[]): Type[] {
  return Array.from(new Set(input));
}

export function removeBioLinkPrefix(input: string): string {
  if (input && input.startsWith("biolink:")) {
    return input.slice(8);
  }
  return input;
}

// This gets the intersection of two sets.
// Lodash _.intersection gets the intersection of two arrays.
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
export function intersection<Type>(
  setA: Set<Type>,
  setB: Set<Type>,
): Set<Type> {
  const resultSet: Set<Type> = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      resultSet.add(elem);
    }
  }
  return resultSet;
}

// see https://stackoverflow.com/a/29585704
export function cartesian(a: number[][]): number[][] {
  // a = array of arrays
  let i: number, j: number, l: number, m: number;
  const o = [];
  if (!a || a.length == 0) return a;

  const a1 = a.splice(0, 1)[0]; // the first array of a
  a = cartesian(a);
  for (i = 0, l = a1.length; i < l; i++) {
    if (a && a.length) {
      for (j = 0, m = a.length; j < m; j++) {
        o.push([a1[i]].concat(a[j]));
      }
    } else {
      o.push([a1[i]]);
    }
  }
  return o;
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

// Do not use on the same promise multiple times
export function timeoutPromise<T>(promise: Promise<T>, timeout: number): Promise<T> {
  let reject = (_: any) => {};
  let resolve = (_: T) => {};
  const cancel = setTimeout(() => {
    reject(new TimeoutError(`Promise exceeded timeout of ${timeout/1000} seconds.`));
  }, timeout);
  promise
    .then(result => resolve(result))
    .catch(error => reject(error))
    .finally(() => clearTimeout(cancel));
  return new Promise<T>((newResolve, newReject) => {
    resolve = newResolve;
    reject = newReject;
  });
}

export const LOCKFILE_STALENESS = {stale: 11000}; // lock expiration in milliseconds to prevent deadlocks
export const LOCKFILE_RETRY_CONFIG = {
  retries: {
    retries: 12,  // 9.5 seconds max
    factor: 2,
    minTimeout: 100,
    maxTimeout: 1000,
  },
  stale: LOCKFILE_STALENESS["stale"],
};

export async function lockWithActionAsync<T>(filePaths: string[], action: () => Promise<T>, debug?: (message: string) => void, lockfileRetryConfig?: any): Promise<T> {
  if (process.env.NODE_ENV !== "production") {
    debug(`Development mode: Skipping lockfile ${process.env.NODE_ENV}`);
    const result = await action();
    return result;
  }

  const releases: (() => void)[] = [];
  const retryConfig = lockfileRetryConfig || LOCKFILE_RETRY_CONFIG;
  try {
    for (const filePath of filePaths) {
      let release = await lockfile.lock(filePath, retryConfig);
      releases.push(release);
    }
    const result = await action();
    return result;
  } catch (error) {
    debug(`Lockfile error: ${error}`);
    throw error;
  } finally {
    for (const release of releases) {
      try {
        if (release) release();
      } catch (error) {
        debug(`Lockfile release error: ${error}`);
      }
    }
  }
}
