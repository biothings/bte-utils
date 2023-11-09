import * as Sentry from "@sentry/node";
import Debug from "debug";
const debug = Debug("bte:telemetry-interface");

const reassurance = "This doesn't affect execution";

class Span {
  span: Sentry.Span;
  constructor(data: unknown) {
    try {
      this.span = Sentry?.getCurrentHub()
        ?.getScope()
        ?.getTransaction()
        ?.startChild(data);
    } catch (error) {
      debug(`Sentry span start error. ${reassurance}`);
      debug(error);
    }
  }

  setData(key: string, data: unknown) {
    try {
      this.span?.setData(key, data);
    } catch (error) {
      debug(`Sentry setData error. ${reassurance}`);
      debug(error);
    }
  }

  finish() {
    try {
      this.span?.finish();
    } catch (error) {
      debug(`Sentry finish error. ${reassurance}`);
      debug(error);
    }
  }
}

export class Telemetry {
  static startSpan(data: unknown) {
    return new Span(data);
  }
  static captureException(error: Error) {
    Sentry.captureException(error);
  }
  static addBreadcrumb(breadcrumb?: Sentry.Breadcrumb) {
    try {
      return Sentry?.addBreadcrumb(breadcrumb);
    } catch (error) {
      debug(`Sentry addBreadcrumb error. ${reassurance}`);
      debug(error);
    }
  }
}
