"use client";
import { X, AlertCircle, CheckCircle } from "lucide-react";

export default function Modal({
    isOpen,
    onClose,
    title,
    message,
    type = "confirmation", // "confirmation" | "notification"
    onConfirm,
    confirmText = "Yes",
    cancelText = "Cancel",
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                {/* header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 cursor-pointer rounded-lg hover:bg-zinc-100 p-1 transition-colors hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* content */}
                <div className="p-4">
                    <div className="flex items-start space-x-3">
                        {type === "confirmation" ? (
                            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-orange-500" />
                        ) : (
                            <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-500" />
                        )}
                        <p className="text-sm leading-relaxed text-gray-600">{message}</p>
                    </div>
                </div>

                {/* footer */}
                <div className="flex justify-end space-x-3 border-t p-4">
                    {type === "confirmation" ? (
                        <>
                            <button
                                onClick={onClose}
                                className="rounded-md bg-gray-100 px-4 py-2 text-sm cursor-pointer font-medium text-gray-700 transition-colors hover:bg-gray-200"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm cursor-pointer font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
