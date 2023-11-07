import Sentry, { Breadcrumb } from "@sentry/node";
import Debug from "debug";
const debug = Debug("bte:telemetry-interface");

class Span {
  span: Sentry.Span;
  constructor(data: unknown) {
    try {
      this.span = Sentry?.getCurrentHub()
        ?.getScope()
        ?.getTransaction()
        ?.startChild(data);
    } catch (error) {
      debug("Sentry span start error. This doesn't affect execution.");
      debug(error);
    }
  }

  setData(key: string, data: unknown) {
    try {
      this.span?.setData(key, data);
    } catch (error) {
      debug("Sentry setData error. This doesn't affect execution.");
      debug(error);
    }
  }

  finish() {
    try {
      this.span?.finish();
    } catch (error) {
      debug("Sentry finish error. This doesn't affect execution.");
      debug(error);
    }
  }
}

// FIX: Calls to sentry not actually going through, probably because Proxy is dumb
export class Telemetry {
  static startSpan(data: unknown) {
    return new Span(data);
  }
  static addBreadcrumb(breadcrumb?: Breadcrumb) {
    try {
      return Sentry?.addBreadcrumb(breadcrumb);
    } catch (error) {
      debug("Sentry addBreadcrumb error. This doesn't affect execution.");
      debug(error);
    }
  }
}
