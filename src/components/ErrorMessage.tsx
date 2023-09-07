type Props = {
    message: string,
    clearErrors: () => void,
}

export default function ErrorMessage({message, clearErrors}: Props) {
    return (
        <div 
            className="errors_container" 
            onAnimationEnd={clearErrors}
        >
            <p className="errors_message" >{message}</p>
        </div>
    )
}