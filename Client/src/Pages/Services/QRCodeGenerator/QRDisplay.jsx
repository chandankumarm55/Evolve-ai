import { QRCodeCanvas } from 'qrcode.react';
import { AlertCircle } from 'lucide-react';
const QRDisplay = ({ value, options, logoUrl }) => {
    if (!value) {
        return (
            <div className="flex flex-col items-center text-muted-foreground p-8">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p>Enter content to generate QR code</p>
            </div>
        );
    }

    return (
        <QRCodeCanvas
            value={ value }
            size={ options.size }
            level={ options.errorCorrection }
            fgColor={ options.fgColor }
            bgColor={ options.bgColor }
            imageSettings={
                logoUrl
                    ? {
                        src: logoUrl,
                        width: options.size * 0.2,
                        height: options.size * 0.2,
                        excavate: true,
                    }
                    : undefined
            }
            className="w-full max-w-full h-auto"
        />
    );
};
export default QRDisplay;