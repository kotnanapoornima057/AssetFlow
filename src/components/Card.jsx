function Card({ children, className = "" }) {
    return (

        <div
            className={`
            bg-white/90
            backdrop-blur-md
            rounded-3xl
            shadow-lg
            border
            border-slate-200
            p-6
            transition-all
            duration-300
            hover:shadow-2xl
            ${className}
        `}
        >
            {children}
        </div>

    );
}

export default Card;