import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Building,
    MapPin,
    FileText,
    User,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';
// import { landAPI } from '@/services/api';

// Steps
import { PropertyDetails } from './steps/PropertyDetails';
import { LocationInfo } from './steps/LocationInfo';
import { Documents } from './steps/Documents';
import { ReviewSubmit } from './steps/ReviewSubmit';

export const Register = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        propertyType: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        area: '',
        price: '',
        description: '',
    });

    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    const steps = [
        { number: 1, title: 'Property Details', icon: Building },
        { number: 2, title: 'Location Info', icon: MapPin },
        { number: 3, title: 'Documents', icon: FileText },
        { number: 4, title: 'Review & Submit', icon: CheckCircle },
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

    const handleLocationSelect = (locationData) => {
        setLocation(locationData);
        handleInputChange('address', locationData.address);

        // Auto-populate location fields from reverse geocoding
        if (locationData.city) {
            handleInputChange('city', locationData.city);
        }
        if (locationData.state) {
            handleInputChange('state', locationData.state);
        }
        if (locationData.postcode) {
            handleInputChange('zipCode', locationData.postcode);
        }
        if (locationData.country) {
            handleInputChange('country', locationData.country);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.title || !formData.description || !formData.area || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!location.lat || !location.lng) {
            toast.error('Please select a location on the map');
            return;
        }

        if (Object.keys(uploadedFiles).length === 0) {
            toast.error('Please upload at least one document');
            return;
        }

        setLoading(true);

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // const landData = {
            //     title: formData.title,
            //     description: formData.description,
            //     area: parseFloat(formData.area),
            //     price: parseFloat(formData.price),
            //     lat: location.lat,
            //     lng: location.lng,
            //     address: location.address,
            //     files: Object.values(uploadedFiles),
            // };

            // await landAPI.registerLand(landData);

            toast.success('Property registered successfully!', {
                description: 'Your property has been submitted and is pending verification.',
            });

            // Reset form
            setFormData({
                title: '',
                propertyType: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                area: '',
                price: '',
                description: '',
            });
            setLocation({ lat: null, lng: null, address: '' });
            setUploadedFiles({});
            setCurrentStep(1);

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Registration failed', {
                description: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <PropertyDetails formData={formData} handleInputChange={handleInputChange} />;
            case 2:
                return <LocationInfo formData={formData} handleInputChange={handleInputChange} location={location} handleLocationSelect={handleLocationSelect} />;
            case 3:
                return <Documents uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />;
            case 4:
                return <ReviewSubmit formData={formData} location={location} uploadedFiles={uploadedFiles} />;
            default:
                return null;
        }
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
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
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
                                            className={`text-xs mt-2 font-medium hidden sm:block ${isActive ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-0.5 mx-2 bg-border relative top-[-20px]">
                                            <div
                                                className={`h-full transition-all duration-300 ${isCompleted ? 'bg-success' : 'bg-border'
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
                        {renderStep()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t border-border mt-6">
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
                                <Button
                                    variant="gradient"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Submit Registration
                                        </>
                                    )}
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

export default Register;
