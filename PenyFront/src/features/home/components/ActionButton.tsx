interface ActionBUttonProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export function ActionButton({ title, subtitle, icon, onClick }: ActionBUttonProps) {
    return (
        <div className=" bg-white rounded-2xl flex flex-row gap-3 items-center !p-3 border-blue-200 border shadow-xs hover:bg-blue-50 transition-transform duration-200 hover:scale-101 cursor-pointer " onClick={onClick}>
            {icon}
            <div className="flex flex-col justify-start">
                <span className="text-left text-md font-bold">{title}</span>
                <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
        </div>
    );
}