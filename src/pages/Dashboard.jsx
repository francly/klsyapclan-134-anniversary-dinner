import { useTasks } from "../context/TaskContext";
import {
    LayoutDashboard,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Calendar as CalendarIcon,
    Trash2,
    Wand2,
    User
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";
import DashboardCharts from "../components/DashboardCharts";
import Modal from "../components/ui/Modal";

export default function Dashboard() {
    const { tasks, getProjectStatus, generateTasks, clearAllTasks } = useTasks();
    const [dinnerDate, setDinnerDate] = useState("2025-12-31");
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        action: null
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "done").length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;

    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const projectStatus = getProjectStatus();

    const openConfirm = (title, message, action) => {
        setConfirmModal({ isOpen: true, title, message, action });
    };

    const closeConfirm = () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    const handleConfirm = () => {
        if (confirmModal.action) {
            confirmModal.action();
        }
        closeConfirm();
    };

    const handleGenerate = () => {
        openConfirm(
            "生成演示数据",
            "这将清空所有现有任务，并根据选定的晚宴日期自动生成一套完整的演示任务。确定要继续吗？",
            () => generateTasks(dinnerDate)
        );
    };

    const handleClear = () => {
        openConfirm(
            "清空所有数据",
            "确定要永久删除所有任务吗？此操作无法撤销。",
            () => clearAllTasks()
        );
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-[#111111] min-h-full transition-colors duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">欢迎回来，查看筹备进度概览</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-[#1f1f1f] px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-[#2d2d2d]">
                    <div className={`w-3 h-3 rounded-full ${projectStatus === "green" ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        项目状态: {projectStatus === "green" ? "正常" : "有延误"}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="总任务" value={totalTasks} icon={LayoutDashboard} color="blue" trend="+2 本周" />
                <StatCard title="已完成" value={completedTasks} icon={CheckCircle2} color="green" trend={`${completionRate}% 完成率`} />
                <StatCard title="待处理" value={pendingTasks} icon={Clock} color="orange" trend="需要关注" />
                <StatCard title="已逾期" value={overdueTasks} icon={AlertCircle} color="red" trend="立即处理" />
            </div>

            {/* Visual Charts */}
            <DashboardCharts tasks={tasks} />

            {/* Admin / Demo Controls */}
            <div className="bg-white dark:bg-[#1f1f1f] rounded-xl shadow-sm border border-gray-100 dark:border-[#2d2d2d] p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">演示数据管理 (Admin)</h2>
                </div>
                <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            设定晚宴日期
                        </label>
                        <input
                            type="date"
                            value={dinnerDate}
                            onChange={(e) => setDinnerDate(e.target.value)}
                            className="w-full md:w-48 px-3 py-2 bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#333] rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors w-full md:w-auto"
                    >
                        <Wand2 className="w-4 h-4" />
                        一键生成任务
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-[#2d2d2d] dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-md transition-colors w-full md:w-auto ml-auto md:ml-0"
                    >
                        <Trash2 className="w-4 h-4" />
                        清空所有数据
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    * 生成功能将根据设定的日期，自动为各筹委小组创建倒计时任务。
                </p>
            </div>

            {/* Task Lists: Overdue (Critical) & Next Up */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 1. Overdue Tasks - High Visibility */}
                <div className="lg:col-span-1">
                    <TaskListCard
                        title={`⚠️ 严重逾期 (${overdueTasks})`}
                        type="danger"
                        tasks={tasks
                            .filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done')
                            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                        }
                        emptyMessage="太棒了！没有逾期任务"
                    />
                </div>

                {/* 2. Upcoming / Priority Tasks */}
                <div className="lg:col-span-1">
                    <TaskListCard
                        title="📅 接下来待办"
                        tasks={tasks
                            .filter(t => t.dueDate && new Date(t.dueDate) >= new Date() && t.status !== 'done')
                            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                            .slice(0, 6)
                        }
                        emptyMessage="暂无即将到期的任务"
                    />
                </div>

                {/* 3. Recent Updates / Activity */}
                <div className="lg:col-span-1">
                    <TaskListCard
                        title="🕒 最近更新"
                        tasks={[...tasks]
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .slice(0, 6)
                        }
                        emptyMessage="暂无活动"
                    />
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={confirmModal.isOpen} onClose={closeConfirm} title={confirmModal.title}>
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        {confirmModal.message}
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={closeConfirm}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#333] rounded-md transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                        >
                            确定执行
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    };

    return (
        <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2d2d2d] transition-colors relative overflow-hidden">
            <div className="flex items-center justify-between z-10 relative">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm z-10 relative">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">{trend}</span>
                </div>
            )}
        </div>
    );
}

function TaskListCard({ title, tasks, emptyMessage, type = "default" }) {
    return (
        <div className={`rounded-xl shadow-sm border p-6 ${type === "danger"
            ? "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
            : "bg-white dark:bg-[#1f1f1f] border-gray-100 dark:border-[#2d2d2d]"
            }`}>
            <h2 className={`text-lg font-semibold mb-4 ${type === "danger" ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white"
                }`}>
                {title}
            </h2>
            <div className="space-y-3">
                {tasks.map(task => {
                    const daysLeft = differenceInDays(new Date(task.dueDate), new Date());
                    return (
                        <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg ${type === "danger" ? "bg-white dark:bg-[#2d2d2d] shadow-sm" : "bg-gray-50 dark:bg-[#2d2d2d]"
                            }`}>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{task.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {task.assignees && task.assignees.length > 0 ? task.assignees.join(", ") : "未分配"}
                                    </span>
                                    {task.dueDate && (
                                        <span className={`text-xs font-medium ${daysLeft < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"
                                            }`}>
                                            {daysLeft < 0 ? `逾期 ${Math.abs(daysLeft)} 天` : format(new Date(task.dueDate), "MM/dd")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium border ${task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50' :
                                task.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50' :
                                    'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50'
                                }`}>
                                {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                            </div>
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                    <p className="text-gray-400 text-center py-4 text-sm">{emptyMessage}</p>
                )}
            </div>
        </div>
    );
}
