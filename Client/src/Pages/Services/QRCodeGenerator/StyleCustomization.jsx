import { Slider } from "../../../components/ui/slider";
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

const StyleCustomization = ({ options, setOptions }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>QR Code Size</Label>
                <Slider
                    min={ 128 }
                    max={ 512 }
                    step={ 32 }
                    value={ [options.size] }
                    onValueChange={ ([size]) => setOptions({ ...options, size }) }
                    className="w-full"
                />
                <div className="text-sm text-muted-foreground">{ options.size }px</div>
            </div>

            <div className="space-y-2">
                <Label>Error Correction Level</Label>
                <div className="flex gap-2">
                    { ['L', 'M', 'Q', 'H'].map((level) => (
                        <Button
                            key={ level }
                            variant={ options.errorCorrection === level ? "default" : "outline" }
                            onClick={ () => setOptions({ ...options, errorCorrection: level }) }
                            className="flex-1"
                        >
                            { level }
                        </Button>
                    )) }
                </div>
            </div>

            <div className="space-y-2">
                <Label>QR Code Color</Label>
                <Input
                    type="color"
                    value={ options.fgColor }
                    onChange={ (e) => setOptions({ ...options, fgColor: e.target.value }) }
                    className="h-10 w-full"
                />
            </div>

            <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                    type="color"
                    value={ options.bgColor }
                    onChange={ (e) => setOptions({ ...options, bgColor: e.target.value }) }
                    className="h-10 w-full"
                />
            </div>
        </div>
    );
};

export default StyleCustomization;