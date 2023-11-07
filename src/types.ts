export interface TrapiLog {
  timestamp: string;
  level: string;
  message: string;
  code: string;
}

declare global {
  var job: {
    log: (logString: string) => void;
  }; // TODO type as Piscina job
}
