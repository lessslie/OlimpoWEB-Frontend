declare module 'react-qr-scanner' {
  import { Component } from 'react';

  interface QrScannerProps {
    onScan: (result: { text: string } | null) => void;
    onError: (error: Error) => void;
    style?: React.CSSProperties;
    className?: string;
    delay?: number;
    constraints?: MediaTrackConstraints | { video: MediaTrackConstraints };
    facingMode?: string;
    resolution?: number;
    chooseDeviceId?: () => string;
    [key: string]: any;
  }

  export default class QrScanner extends Component<QrScannerProps> {}
}
