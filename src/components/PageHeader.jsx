function PageHeader({
    title,
    subtitle,
    action
}) {
    return (

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-8">

            <div>

                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">

                    {title}

                </h1>

                {subtitle && (

                    <p className="text-slate-500 mt-2">

                        {subtitle}

                    </p>

                )}

            </div>

            {action}

        </div>

    );
}

export default PageHeader;