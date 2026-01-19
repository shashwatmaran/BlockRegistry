import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Upload,
    CheckCircle,
    AlertCircle,
    X,
} from 'lucide-react';

export const Documents = ({ uploadedFiles, setUploadedFiles }) => {

    const handleFileUpload = (docType, event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFiles(prev => ({
                ...prev,
                [docType]: file,
            }));
            toast.success(`${docType} uploaded successfully!`);
        }
    };

    const handleRemoveFile = (docType) => {
        setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[docType];
            return newFiles;
        });
        toast.info(`${docType} removed`);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label>Upload Required Documents *</Label>

                <div className="grid gap-4">
                    {[
                        { name: 'Title Deed', required: true },
                        { name: 'Survey Report', required: true },
                        { name: 'Tax Documents', required: false },
                        { name: 'Building Permit', required: false },
                    ].map((doc, idx) => (
                        <div
                            key={idx}
                            className="p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors">
                                        {uploadedFiles[doc.name] ? (
                                            <CheckCircle className="h-5 w-5 text-success" />
                                        ) : (
                                            <Upload className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium flex items-center">
                                            {doc.name}
                                            {doc.required && (
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    Required
                                                </Badge>
                                            )}
                                        </p>
                                        {uploadedFiles[doc.name] ? (
                                            <p className="text-xs text-success">
                                                {uploadedFiles[doc.name].name}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                PDF, JPG, or PNG (Max 10MB)
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {uploadedFiles[doc.name] ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFile(doc.name)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <>
                                            <Input
                                                id={`file-${idx}`}
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(doc.name, e)}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById(`file-${idx}`).click()}
                                            >
                                                Choose File
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-foreground">
                    <p className="font-medium mb-1">Document Verification</p>
                    <p className="text-xs opacity-90">
                        All documents will be stored securely on IPFS and referenced on the blockchain.
                        Ensure all documents are clear and legible.
                    </p>
                </div>
            </div>

            <div className="flex items-start space-x-2">
                <Checkbox id="terms" />
                <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                    I confirm that all uploaded documents are authentic and I have the legal right
                    to register this property on the blockchain.
                </label>
            </div>
        </div>
    );
};
