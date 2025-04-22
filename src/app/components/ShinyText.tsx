interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

export default function ShinyText({ text, disabled = false, speed = 5, className = '' }:ShinyTextProps) {
    const animationDuration = `${speed}s`;

    return (
        <div
            className={`shiny-text  ${disabled ? 'disabled' : ''} bg-red-600`}
            style={{ animationDuration }}
        >
            {text}
        </div>
    );
};
