import React from "react";

function SearchResult({
    icon,
    title,
    subtitle,
    onClick,
}) {
    return (
        <div
            onClick={onClick}
            className="
                flex
                items-center
                gap-4
                p-4
                hover:bg-blue-50
                cursor-pointer
                rounded-lg
                transition
            "
        >
            <div className="text-3xl">
                {icon}
            </div>

            <div>

                <h3 className="font-semibold">
                    {title}
                </h3>

                <p className="text-sm text-gray-500">
                    {subtitle}
                </p>

            </div>

        </div>
    );
}

export default SearchResult;