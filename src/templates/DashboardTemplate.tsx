import {MenuBar} from "../components/MenuBar";

export function DashboardTemplate({children}) {
    return (
        <div className="flex h-[100vh]">
            <MenuBar/>
            <div className="p-6 overflow-y-scroll w-full">
                {children}
            </div>
        </div>
    )
}