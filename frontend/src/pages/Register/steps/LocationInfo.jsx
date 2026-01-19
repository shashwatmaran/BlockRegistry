import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { MapPicker } from '@/components/MapPicker';

export const LocationInfo = ({ formData, handleInputChange, location, handleLocationSelect }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                        id="state"
                        placeholder="NY"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code *</Label>
                    <Input
                        id="zipCode"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                        id="country"
                        placeholder="United States"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                    />
                </div>
            </div>

            {/* Interactive Map */}
            <div className="space-y-2">
                <Label>Property Location *</Label>
                <div className="relative h-96">
                    <MapPicker onLocationSelect={handleLocationSelect} />
                </div>
                {location.address && (
                    <p className="text-sm text-muted-foreground mt-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {location.address}
                    </p>
                )}
            </div>
        </div>
    );
};
