import { useState } from 'react';
import { X, Star, Check, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: any) => Promise<void>;
    isLoading: boolean;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit, isLoading }: FeedbackModalProps) {
    const [q1, setQ1] = useState<string | null>(null);
    const [q2, setQ2] = useState<string | null>(null);
    const [q3, setQ3] = useState<string | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!q1 || !q2 || !q3 || rating === 0) return;
        onSubmit({
            isAccurate: q1,
            isFast: q2,
            wouldUseAgain: q3,
            rating
        });
    };

    const isFormValid = q1 && q2 && q3 && rating > 0;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">Feedback / Ra'yi Celinta</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Q1 */}
                        <div>
                            <p className="text-gray-700 font-medium mb-2">1. Si sax miyuu kuu caawiyey chatbot ka?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setQ1('yes')}
                                    className={`flex-1 py-2 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${q1 === 'yes' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <Check className={`w-4 h-4 ${q1 === 'yes' ? 'opacity-100' : 'opacity-0'}`} /> Yes
                                </button>
                                <button
                                    onClick={() => setQ1('no')}
                                    className={`flex-1 py-2 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${q1 === 'no' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <Check className={`w-4 h-4 ${q1 === 'no' ? 'opacity-100' : 'opacity-0'}`} /> No
                                </button>
                            </div>
                        </div>

                        {/* Q2 */}
                        <div>
                            <p className="text-gray-700 font-medium mb-2">2. Si dhaqso leh miyuu ku caawiyey?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setQ2('yes')}
                                    className={`flex-1 py-2 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${q2 === 'yes' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <Check className={`w-4 h-4 ${q2 === 'yes' ? 'opacity-100' : 'opacity-0'}`} /> Yes
                                </button>
                                <button
                                    onClick={() => setQ2('no')}
                                    className={`flex-1 py-2 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${q2 === 'no' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <Check className={`w-4 h-4 ${q2 === 'no' ? 'opacity-100' : 'opacity-0'}`} /> No
                                </button>
                            </div>
                        </div>

                        {/* Q3 */}
                        <div>
                            <p className="text-gray-700 font-medium mb-2">3. Ma isticmaali lahayd chatbotka markale?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setQ3('yes')}
                                    className={`flex-1 py-2 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${q3 === 'yes' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <Check className={`w-4 h-4 ${q3 === 'yes' ? 'opacity-100' : 'opacity-0'}`} /> Yes
                                </button>
                                <button
                                    onClick={() => setQ3('no')}
                                    className={`flex-1 py-2 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${q3 === 'no' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <Check className={`w-4 h-4 ${q3 === 'no' ? 'opacity-100' : 'opacity-0'}`} /> No
                                </button>
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <p className="text-gray-700 font-medium mb-2 text-center">Please rate us</p>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="p-1 transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid || isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                            </>
                        ) : (
                            'Submit Feedback'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
