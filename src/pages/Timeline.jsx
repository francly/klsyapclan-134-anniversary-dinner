import { useTasks } from "../context/TaskContext";
import { format, isSameMonth, parseISO, startOfMonth } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar, CheckCircle2, Circle, Clock, Filter, X, User } from "lucide-react";
import { useState } from "react";
import { committee } from "../data/committee";

export default function Timeline() {
    const { tasks } = useTasks();

    // Get all unique members for filter
    const allMembers = Array.from(new Set(committee.flatMap(c => c.members)));

    // Filter States
    const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterAssignee, setFilterAssignee] = useState("all");

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        if (!task.dueDate) return false;

        // Month Filter
        if (selectedMonth) {
            const taskDate = new Date(task.dueDate);
            const filterDate = new Date(selectedMonth);
            if (!isSameMonth(taskDate, filterDate)) return false;
        }

        // Status Filter
        if (filterStatus !== "all" && task.status !== filterStatus) return false;

        // Priority Filter
        if (filterPriority !== "all" && task.priority !== filterPriority) return false;

        // Assignee Filter
        if (filterAssignee !== "all") {
            const taskAssignees = task.assignees || (task.assignee ? [task.assignee] : []);
            if (!taskAssignees.includes(filterAssignee)) return false;
        }

        return true;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Group by month
    const groupedTasks = filteredTasks.reduce((groups, task) => {
        const date = new Date(task.dueDate);
        const key = format(date, "yyyy年MM月", { locale: zhCN });
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
        return groups;
    }, {});

    const clearFilters = () => {
        setSelectedMonth("");
        setFilterStatus("all");
        setFilterPriority("all");
        setFilterAssignee("all");
    };

    const hasFilters = selectedMonth || filterStatus !== "all" || filterPriority !== "all" || filterAssignee !== "all";

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111111] transition-colors h-full flex flex-col">
            {/* Header & toolbar */}
            <div className="sticky top-0 z-40 bg-gray-50/95 dark:bg-[#111111]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#2d2d2d] px-4 md:px-8 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center justify-between md:justify-start gap-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-6 h-6" />
                                <span className="hidden md:inline">时间轴</span>
                            </h1>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="md:hidden text-xs text-blue-500 font-medium"
                                >
                                    重置筛选
                                </button>
                            )}
                        </div>

                        {/* Filter Toolbar */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Month Picker */}
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-3 py-1.5 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-36"
                            />

                            {/* Status Filter */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-1.5 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">所有状态</option>
                                <option value="todo">待办</option>
                                <option value="in_progress">进行中</option>
                                <option value="done">已完成</option>
                            </select>

                            {/* Priority Filter */}
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="px-3 py-1.5 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">所有优先级</option>
                                <option value="high">高</option>
                                <option value="medium">中</option>
                                <option value="low">低</option>
                            </select>

                            {/* Assignee Filter */}
                            <div className="relative">
                                <select
                                    value={filterAssignee}
                                    onChange={(e) => setFilterAssignee(e.target.value)}
                                    className="px-3 py-1.5 pl-8 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none min-w-[100px]"
                                >
                                    <option value="all">所有负责人</option>
                                    {allMembers.map(member => (
                                        <option key={member} value={member}>{member}</option>
                                    ))}
                                </select>
                                <User className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            <button
                                onClick={clearFilters}
                                disabled={!hasFilters}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg border transition-all ${hasFilters
                                        ? "bg-white dark:bg-[#2d2d2d] border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#333] shadow-sm cursor-pointer"
                                        : "bg-transparent border-transparent text-gray-300 dark:text-gray-700 cursor-not-allowed hidden md:flex"
                                    }`}
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>清除筛选</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-[#333] before:to-transparent pb-20 z-0">
                        {Object.entries(groupedTasks).map(([month, monthTasks]) => (
                            <div key={month} className="relative pt-4">
                                {/* Dark Pill Month Header */}
                                <div className="relative mb-8 flex justify-center z-10">
                                    <span className="inline-block px-6 py-2 text-xl font-bold font-mono tracking-tight text-white bg-gray-900 dark:bg-black rounded-full shadow-xl border-4 border-gray-50 dark:border-[#111111] relative">
                                        {month}
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    {monthTasks.map(task => {
                                        const isDone = task.status === "done";
                                        const isInProgress = task.status === "in_progress";

                                        return (
                                            <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                {/* Icon */}
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white dark:bg-[#1f1f1f] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:static ${isDone ? "border-green-500 text-green-500" :
                                                    isInProgress ? "border-orange-500 text-orange-500" :
                                                        "border-blue-500 text-blue-500"
                                                    }`}>
                                                    {isDone ? <CheckCircle2 className="w-5 h-5" /> :
                                                        isInProgress ? <Clock className="w-5 h-5" /> :
                                                            <Circle className="w-5 h-5" />}
                                                </div>

                                                {/* Card */}
                                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#1f1f1f] p-4 rounded-xl border border-l-4 shadow-sm ml-14 md:ml-0 transition-all hover:shadow-md ${isDone ? "border-l-green-500 border-y-gray-200 border-r-gray-200 dark:border-y-[#2d2d2d] dark:border-r-[#2d2d2d]" :
                                                    isInProgress ? "border-l-orange-500 border-y-gray-200 border-r-gray-200 dark:border-y-[#2d2d2d] dark:border-r-[#2d2d2d]" :
                                                        "border-l-blue-500 border-y-gray-200 border-r-gray-200 dark:border-y-[#2d2d2d] dark:border-r-[#2d2d2d]"
                                                    }`}>
                                                    <div className="flex items-center justify-between space-x-2 mb-2">
                                                        <div className="font-bold text-gray-900 dark:text-gray-200 line-clamp-1">{task.title}</div>
                                                        <time className={`font-caveat font-medium text-sm whitespace-nowrap px-2 py-0.5 rounded ${isDone ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" :
                                                            isInProgress ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400" :
                                                                "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                                                            }`}>
                                                            {format(new Date(task.dueDate), "d日", { locale: zhCN })}
                                                        </time>
                                                    </div>

                                                    <div className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#2d2d2d]">
                                                        {/* Assignees */}
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className="flex -space-x-2">
                                                                {(task.assignees && task.assignees.length > 0 ? task.assignees : [task.assignee]).filter(Boolean).map((member, i) => (
                                                                    <div key={i} className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-[#333] border border-white dark:border-[#1f1f1f] text-[10px] text-gray-600 dark:text-gray-300 ring-1 ring-white dark:ring-[#1f1f1f]" title={member}>
                                                                        {member.slice(0, 1)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                                                                {(task.assignees && task.assignees.length > 0 ? task.assignees.join(", ") : task.assignee || "未分配")}
                                                            </span>
                                                        </div>

                                                        {/* Priority Badge */}
                                                        <div className={`px-2 py-0.5 rounded text-[10px] font-medium border ${task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50' :
                                                            task.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50' :
                                                                'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50'
                                                            }`}>
                                                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {filteredTasks.length === 0 && (
                            <div className="text-center py-12 ml-12 md:ml-0 bg-white dark:bg-[#1f1f1f] rounded-xl border border-dashed border-gray-300 dark:border-[#333] p-8">
                                <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">没有找到符合条件的任务</p>
                                <button onClick={clearFilters} className="text-blue-500 hover:text-blue-600 text-sm mt-2">
                                    清除所有筛选
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
