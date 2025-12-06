import { useState } from 'react';
import {
    HelpCircle,
    ChevronDown,
    ChevronUp,
    LayoutDashboard,
    ListTodo,
    CalendarClock,
    BarChart3,
    Moon,
    Sun
} from 'lucide-react';

export default function Help() {
    const [openSection, setOpenSection] = useState('quick-start');

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const sections = [
        {
            id: 'quick-start',
            title: '⚡️ 快速上手 (Quick Start)',
            icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
            content: (
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p>欢迎使用 134周年晚宴筹备管理系统！这是一个专为高效协作设计的一站式平台。</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>仪表盘</strong>：一进来的首页，可以看到所有待办任务的概览和倒计时。</li>
                        <li><strong>任务管理</strong>：在 <span className="bg-gray-100 dark:bg-[#333] px-1 rounded text-sm">任务</span> 页面，您可以分配工作、追踪进度。</li>
                        <li><strong>活动流程</strong>：在 <span className="bg-gray-100 dark:bg-[#333] px-1 rounded text-sm">流程</span> 页面，查看晚宴当天的详细时间表。</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'tasks',
            title: '📋 任务管理 (Tasks)',
            icon: <ListTodo className="w-5 h-5 text-green-500" />,
            content: (
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <h4 className="font-bold text-gray-900 dark:text-white">如何使用三种视图？</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>表格视图 (Table)</strong>：像 Excel 一样的列表，适合快速编辑和查看大量任务详情。</li>
                        <li><strong>看板视图 (Kanban)</strong>：卡片式管理，直观地看到“待办”、“进行中”和“已完成”的任务。</li>
                        <li><strong>甘特图 (Gantt)</strong>：时间轴视图，适合规划任务的开始和结束时间。</li>
                    </ul>
                    <h4 className="font-bold text-gray-900 dark:text-white mt-4">如何添加任务？</h4>
                    <p>点击页面顶部的 <span className="text-blue-500 font-bold">+ 新建任务</span> 按钮，或者在列表中直接输入任务名称并回车。</p>
                </div>
            )
        },
        {
            id: 'program',
            title: '📅 活动流程 (Program)',
            icon: <CalendarClock className="w-5 h-5 text-purple-500" />,
            content: (
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p>全员同步的实时流程表。任何修改都会立刻推送到所有人的手机或电脑上。</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>实时高亮</strong>：系统会自动根据当前时间，高亮显示“正在进行”的环节。</li>
                        <li><strong>时光穿梭</strong>：点击底部的 <span className="bg-amber-100 text-amber-700 px-1 rounded text-xs">模拟模式</span>，可以模拟晚宴当天的任意时间点，测试流程显示。</li>
                        <li><strong>修改流程</strong>：直接点击任何活动的时间或标题，即可进行修改（修改会自动保存）。</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'charts',
            title: '📊 数据统计 (Analytics)',
            icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
            content: (
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p>在仪表盘底部，您可以查看详细的工作统计报表：</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>状态分布</strong>：查看还有多少任务未完成。</li>
                        <li><strong>优先级分布</strong>：了解多少“高优先级”任务急需处理。</li>
                        <li><strong>成员工作量</strong>：查看每位筹委负责的任务数量，合理分配工作。</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'tips',
            title: '💡 实用技巧 (Tips)',
            icon: <Sun className="w-5 h-5 text-amber-500" />,
            content: (
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-[#333] rounded-lg">
                            <Moon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">暗黑模式</p>
                            <p>点击左下角的“月亮/太阳”图标，可以在深色和浅色模式间切换，夜间工作更护眼。</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 mt-2">
                        <div className="p-2 bg-gray-100 dark:bg-[#333] rounded-lg">
                            <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">侧边栏折叠</p>
                            <p>在手机上，点击左上角的菜单按钮可以打开或关闭侧边栏。</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111111] transition-colors p-4 md:p-8 pb-24">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4">
                        <HelpCircle className="w-8 h-8 text-blue-500" />
                        使用说明 (Help Center)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        这里包含了所有您需要知道的操作指南和技巧。
                    </p>
                </div>

                <div className="space-y-4">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-100 dark:border-[#222] overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-50 dark:bg-[#2d2d2d] rounded-lg">
                                        {section.icon}
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {section.title}
                                    </span>
                                </div>
                                {openSection === section.id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            <div
                                className={`
                                    transition-all duration-300 ease-in-out px-6
                                    ${openSection === section.id ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0 overflow-hidden'}
                                `}
                            >
                                <div className="pt-2 border-t border-gray-100 dark:border-[#2d2d2d]">
                                    {section.content}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-gray-400 text-sm">
                    <p>如果还有其他问题，请联系系统管理员。</p>
                    <p className="mt-2">v0.2.0 Full Stack Edition</p>
                </div>
            </div>
        </div>
    );
}
