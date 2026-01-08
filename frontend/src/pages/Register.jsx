import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  MapPin,
  Building,
  DollarSign,
  User,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    area: '',
    price: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    ownerWallet: '',
    documents: [],
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: 'Property Details', icon: Building },
    { number: 2, title: 'Location Info', icon: MapPin },
    { number: 3, title: 'Documents', icon: FileText },
    { number: 4, title: 'Owner Details', icon: User },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('Property registration submitted successfully!', {
      description: 'Your property will be verified and added to the blockchain.',
    });
    // Reset form or redirect
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] mb-2">
            Register New Property
          </h1>
          <p className="text-muted-foreground">
            Submit your property details to register on the blockchain
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-success border-success text-success-foreground'
                          : isActive
                          ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
                          : 'bg-muted border-border text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium hidden sm:block ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-border relative top-[-20px]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-success' : 'bg-border'
                        }`}
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              {React.createElement(steps[currentStep - 1].icon, { className: 'h-5 w-5 mr-2 text-primary' })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Fill in the required information for step {currentStep} of {totalSteps}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
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
                    <Label htmlFor="price">Estimated Value (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            )}

            {/* Step 2: Location Info */}
            {currentStep === 2 && (
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
                    <Select>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="relative h-64 bg-muted rounded-lg overflow-hidden border border-border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Map view will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
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
                        className="p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Upload className="h-5 w-5 text-primary" />
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
                              <p className="text-xs text-muted-foreground">
                                PDF, JPG, or PNG (Max 10MB)
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
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
            )}

            {/* Step 4: Owner Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Full Name *</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Doe"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email Address *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerWallet">Wallet Address *</Label>
                  <div className="relative">
                    <Input
                      id="ownerWallet"
                      placeholder="0x..."
                      className="font-mono"
                      value={formData.ownerWallet}
                      onChange={(e) => handleInputChange('ownerWallet', e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This wallet will be used to sign the property registration transaction
                  </p>
                </div>

                {/* Summary */}
                <div className="p-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/30 rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                    Registration Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Property Type:</div>
                    <div className="font-medium">{formData.propertyType || 'Not specified'}</div>
                    <div className="text-muted-foreground">Location:</div>
                    <div className="font-medium">
                      {formData.city && formData.state
                        ? `${formData.city}, ${formData.state}`
                        : 'Not specified'}
                    </div>
                    <div className="text-muted-foreground">Area:</div>
                    <div className="font-medium">{formData.area ? `${formData.area} sq ft` : 'Not specified'}</div>
                    <div className="text-muted-foreground">Value:</div>
                    <div className="font-medium">{formData.price ? `$${formData.price}` : 'Not specified'}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="final-terms" />
                  <label
                    htmlFor="final-terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    I agree to the terms and conditions and understand that this registration will 
                    create an immutable record on the blockchain that cannot be deleted.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button variant="gradient" onClick={handleNext}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="gradient" onClick={handleSubmit}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6 bg-muted/50 backdrop-blur-sm border-border/50">
          <CardContent className="py-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Need Help?</p>
                <p className="text-muted-foreground">
                  Contact our support team at{' '}
                  <a href="mailto:support@blockregistry.com" className="text-primary hover:underline">
                    support@blockregistry.com
                  </a>{' '}
                  or visit our{' '}
                  <a href="#" className="text-primary hover:underline">
                    documentation
                  </a>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
