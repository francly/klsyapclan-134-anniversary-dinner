import { committee } from "../data/committee";
import { User } from "lucide-react";

export default function Team() {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-white transition-colors">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">筹委会名单</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">134周年雪隆葉氏宗祠晚宴</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {committee.map((group) => (
                        <div key={group.role} className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-sm hover:shadow-md transition-all">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-[#2d2d2d] pb-2">
                                {group.role}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {group.members.map((member) => (
                                    <div key={member} className="flex items-center bg-gray-100 dark:bg-[#2d2d2d] px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                        <User className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500" />
                                        {member}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
