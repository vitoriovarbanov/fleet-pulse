'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
};

type StepIndicatorProps = {
    steps: readonly Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
    allowNavigation?: boolean;
};

export function StepIndicator({ steps, currentStep, onStepClick, allowNavigation = false }: StepIndicatorProps) {
    return (
        <div className="relative">
            {/* Background track */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/50" />

            <motion.div
                className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary via-primary to-secondary"
                initial={{ width: '0%' }}
                animate={{
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />

            <div className="relative flex items-start justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const isUpcoming = currentStep < step.id;
                    const isClickable = allowNavigation && (isCompleted || isCurrent);

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className={cn('flex flex-col items-center', isClickable && 'cursor-pointer group')}
                            onClick={() => isClickable && onStepClick?.(step.id)}
                        >
                            {/* Step circle */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1 : 0.9,
                                }}
                                transition={{ duration: 0.2 }}
                                className="relative"
                            >
                                {/* Glow effect for current step */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl bg-primary/30 blur-lg"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 0.3, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                )}

                                {/* Circle background */}
                                <motion.div
                                    className={cn(
                                        'relative flex items-center justify-center h-10 w-10 rounded-xl',
                                        'transition-all duration-300',
                                        'border-2',
                                        isCompleted && ['bg-primary border-primary', 'shadow-md shadow-primary/20'],
                                        isCurrent && [
                                            'bg-primary border-primary',
                                            'shadow-lg shadow-primary/30',
                                            'ring-4 ring-primary/20',
                                        ],
                                        isUpcoming && [
                                            'bg-muted/50 border-border',
                                            'group-hover:border-primary/30 group-hover:bg-muted',
                                        ]
                                    )}
                                    whileHover={isClickable ? { scale: 1.05 } : undefined}
                                    whileTap={isClickable ? { scale: 0.95 } : undefined}
                                >
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: isCompleted ? [0, 1.2, 1] : 1,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-5 w-5 text-primary-foreground" strokeWidth={3} />
                                        ) : (
                                            <Icon
                                                className={cn(
                                                    'h-5 w-5 transition-colors duration-200',
                                                    isCurrent && 'text-primary-foreground',
                                                    isUpcoming && 'text-muted-foreground group-hover:text-foreground'
                                                )}
                                            />
                                        )}
                                    </motion.div>
                                </motion.div>
                            </motion.div>

                            {/* Step label */}
                            <div className="mt-3 text-center max-w-[100px]">
                                <motion.p
                                    className={cn(
                                        'text-sm font-medium transition-colors duration-200',
                                        isCurrent && 'text-foreground',
                                        isCompleted && 'text-foreground',
                                        isUpcoming && 'text-muted-foreground'
                                    )}
                                    animate={{
                                        fontWeight: isCurrent ? 600 : 500,
                                    }}
                                >
                                    {step.title}
                                </motion.p>
                                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// Compact variant for smaller spaces
type CompactStepIndicatorProps = {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
};

export function CompactStepIndicator({ currentStep, totalSteps, labels }: CompactStepIndicatorProps) {
    return (
        <div className="flex items-center gap-3">
            {/* Step dots */}
            <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }, (_, i) => {
                    const stepNum = i + 1;
                    const isCompleted = currentStep > stepNum;
                    const isCurrent = currentStep === stepNum;

                    return (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                scale: isCurrent ? 1.2 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                'h-2 rounded-full transition-all duration-300',
                                isCurrent ? 'w-6' : 'w-2',
                                isCompleted || isCurrent ? 'bg-primary' : 'bg-muted'
                            )}
                        />
                    );
                })}
            </div>

            {/* Step label */}
            {labels && labels[currentStep - 1] && (
                <motion.span
                    key={currentStep}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium text-muted-foreground"
                >
                    {labels[currentStep - 1]}
                </motion.span>
            )}

            {/* Step count */}
            <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                {currentStep} / {totalSteps}
            </span>
        </div>
    );
}

// Progress arc variant (circular progress)
type ProgressArcProps = {
    currentStep: number;
    totalSteps: number;
    size?: number;
    strokeWidth?: number;
};

export function ProgressArc({ currentStep, totalSteps, size = 48, strokeWidth = 3 }: ProgressArcProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = currentStep / totalSteps;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="relative mr-5" style={{ width: size, height: size }}>
            <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                />
            </svg>

            {/* Progress circle */}
            <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progress-gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
                <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold tabular-nums">
                    {currentStep}/{totalSteps}
                </span>
            </div>
        </div>
    );
}
