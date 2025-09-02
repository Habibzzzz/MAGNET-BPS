// SuccessModal.js
import React, { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SuccessModal = ({ isOpen, onClose, title, message, buttonText, redirectUrl = "/dataMagang" }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRedirect = () => {
        router.push(redirectUrl);
        setLoading(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 animate-bounce-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                        <CheckCircle className="w-12 h-12 text-green-600 animate-check" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {title || "Berhasil!"}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {message || "Data telah berhasil disimpan ke dalam sistem."}
                    </p>

                    {/* Button */}
                    <button
                        onClick={handleRedirect}
                        className="w-full cursor-pointer bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {buttonText || "Kembali"}
                    </button>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes bounce-in {
                    0% {
                        transform: scale(0.3) translateY(-50px);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.05) translateY(0);
                        opacity: 1;
                    }
                    70% {
                        transform: scale(0.95);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes scale-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes check {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-bounce-in {
                    animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                .animate-scale-in {
                    animation: scale-in 0.5s ease-out 0.2s both;
                }

                .animate-check {
                    animation: check 0.6s ease-out 0.4s both;
                }
            `}</style>
        </div>
    );
};

export default SuccessModal;
