import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { IndianRupee, Info } from 'lucide-react';

export const PropertyDetails = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                    id="title"
                    placeholder="e.g., Residential Plot in Downtown"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select
                    value={formData.propertyType}
                    onValueChange={(value) => handleInputChange('propertyType', value)}
                >
                    <SelectTrigger id="propertyType">
                        <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="agricultural">Agricultural</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="area">Property Area (sq ft) *</Label>
                    <Input
                        id="area"
                        type="number"
                        placeholder="e.g., 2500"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="price">Estimated Value (INR) *</Label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="price"
                            type="number"
                            placeholder="e.g., 450000"
                            className="pl-10"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Property Description</Label>
                <Textarea
                    id="description"
                    placeholder="Describe the property features, amenities, etc."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                />
            </div>

            <div className="p-4 bg-info/10 border border-info/30 rounded-lg flex items-start space-x-3">
                <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div className="text-sm text-info-foreground">
                    <p className="font-medium mb-1">Why we need this information</p>
                    <p className="text-xs opacity-90">
                        Property details help verify the legitimacy of your registration and ensure
                        accurate blockchain records.
                    </p>
                </div>
            </div>
        </div>
    );
};
