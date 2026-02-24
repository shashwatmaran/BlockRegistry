import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, FileText } from 'lucide-react';

export const ReviewSubmit = ({ formData, location, uploadedFiles }) => {
    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/30 rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                    Registration Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Property Title:</div>
                    <div className="font-medium">{formData.title || 'Not specified'}</div>
                    <div className="text-muted-foreground">Property Type:</div>
                    <div className="font-medium">{formData.propertyType || 'Not specified'}</div>
                    <div className="text-muted-foreground">Location:</div>
                    <div className="font-medium truncate" title={location.address}>
                        {location.address || 'Not specified'}
                    </div>
                    <div className="text-muted-foreground">Area:</div>
                    <div className="font-medium">{formData.area ? `${formData.area} sq ft` : 'Not specified'}</div>
                    <div className="text-muted-foreground">Value:</div>
                    <div className="font-medium">{formData.price ? `₹${formData.price}` : 'Not specified'}</div>
                    <div className="text-muted-foreground">Documents:</div>
                    <div className="font-medium">{Object.keys(uploadedFiles).length} file(s)</div>
                </div>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
                <Label>Uploaded Documents</Label>
                <div className="space-y-2">
                    {Object.entries(uploadedFiles).map(([name, file]) => (
                        <div key={name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{name}</p>
                                    <p className="text-xs text-muted-foreground">{file.name}</p>
                                </div>
                            </div>
                            <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-start space-x-2">
                <Checkbox id="final-terms" />
                <label
                    htmlFor="final-terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                    I confirm that all information provided is accurate and I agree to the terms and conditions.
                    I understand that this registration will create an immutable record on the blockchain.
                </label>
            </div>
        </div>
    );
};
