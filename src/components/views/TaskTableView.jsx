import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CheckCircle2, Circle, Star, User, Calendar, Clock } from "lucide-react";
import { committee } from "../../data/committee";

import { useState, useRef, useEffect } from "react";
import DatePickerPopover from "../ui/DatePickerPopover";

export default function TaskTableView({ tasks, onTaskClick, onUpdate }) {
    const [editingDateId, setEditingDateId] = useState(null);
    // Track which task has the date popover open
    const [activeDatePopoverId, setActiveDatePopoverId] = useState(null);

    const StatusPill = ({ status }) => {
        const getStatusConfig = (s) => {
            switch (s) {
                case 'done': return { label: '已完成', color: 'bg-[#00c875] text-white' };
                case 'in_progress': return { label: '进行中', color: 'bg-[#fdab3d] text-white' };
                default: return { label: '待办', color: 'bg-[#c4c4c4] text-white' }; // Default for 'todo'
            }
        };
        const config = getStatusConfig(status);
        return (
            <span className={`px-2 py-1 rounded-sm text-xs font-semibold w-24 text-center block ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const PriorityPill = ({ priority }) => {
        const colors = {
            high: "bg-[#e2445c] text-white", // Red
            medium: "bg-[#fdab3d] text-white", // Orange
            low: "bg-[#003459] text-white", // Dark Blueish
        };
        const labels = {
            high: "高",
            medium: "中",
            low: "低",
        };
        return (
            <span className={`px-2 py-0.5 rounded textxs font-medium ${colors[priority]}`}>
                {labels[priority]}
            </span>
        );
    };

    return (
        <div className="flex-1 overflow-auto bg-white dark:bg-[#111111] p-0">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#f5f6f8] dark:bg-[#1e1e1e] sticky top-0 z-10 text-gray-500 dark:text-gray-400 text-xs font-semibold tracking-wide border-b border-gray-200 dark:border-[#333]">
                    <tr>
                        <th className="px-3 py-2.5 w-10 text-center"></th>
                        <th className="px-3 py-2.5 border-r border-gray-100 dark:border-[#2d2d2d]">任务名称</th>
                        <th className="px-3 py-2.5 border-r border-gray-100 dark:border-[#2d2d2d] w-48">负责人</th>
                        <th className="px-3 py-2.5 border-r border-gray-100 dark:border-[#2d2d2d] w-36">截止日期</th>
                        <th className="px-3 py-2.5 border-r border-gray-100 dark:border-[#2d2d2d] w-32">状态</th>
                        <th className="px-3 py-2.5 w-28">优先级</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-[#2d2d2d]">
                    {tasks.map((task) => (
                        <tr
                            key={task.id}
                            onClick={() => onTaskClick(task.id)}
                            className="hover:bg-blue-50/50 dark:hover:bg-[#252525] group transition-colors bg-white dark:bg-[#111111]"
                        >
                            <td className="px-3 py-3 text-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdate(task.id, { status: task.status === "done" ? "todo" : "done" });
                                    }}
                                    className={`transition-colors ${task.status === "done" ? "text-[#00c875]" : "text-gray-300 hover:text-[#00c875]"}`}
                                >
                                    {task.status === "done" ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                            </td>
                            <td className="px-3 py-3 border-r border-gray-50 dark:border-[#2d2d2d]">
                                <input
                                    type="text"
                                    value={task.title}
                                    checked={undefined}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                                    className={`w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-900 dark:text-gray-200"}`}
                                />
                            </td>
                            <td className="px-3 py-3 border-r border-gray-50 dark:border-[#2d2d2d]">
                                <div className="flex items-center gap-2 relative group/assignee">
                                    <div className="flex -space-x-1">
                                        {task.assignees && task.assignees.slice(0, 2).map((assignee, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-[#111111] text-white font-bold" title={assignee}>
                                                {assignee.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-400 text-xs truncate max-w-[100px]">
                                        {task.assignees && task.assignees.length > 0 ? task.assignees.join(", ") : "未分配"}
                                    </span>
                                    <select
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        value={task.assignees?.[0] || ""}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onUpdate(task.id, { assignees: [e.target.value] });
                                        }}
                                    >
                                        <option value="">未分配</option>
                                        {committee.map(group => (
                                            <optgroup key={group.role} label={group.role}>
                                                {group.members.map(member => (
                                                    <option key={member} value={member}>{member}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </td>
                            <td
                                className="px-3 py-3 border-r border-gray-50 dark:border-[#2d2d2d] text-gray-600 dark:text-gray-400 font-mono text-xs relative group/date cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Toggle popover
                                    setActiveDatePopoverId(activeDatePopoverId === task.id ? null : task.id);
                                }}
                            >
                                <span className={!task.dueDate ? "text-gray-300 group-hover:text-gray-400" : ""}>
                                    {task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "设置日期"}
                                </span>

                                {activeDatePopoverId === task.id && (
                                    <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 z-50">
                                        <DatePickerPopover
                                            onClose={() => setActiveDatePopoverId(null)}
                                            onSelect={(date) => {
                                                onUpdate(task.id, { dueDate: date.toISOString() });
                                                setActiveDatePopoverId(null);
                                            }}
                                        />
                                    </div>
                                )}
                            </td>
                            <td className="px-3 py-3 border-r border-gray-50 dark:border-[#2d2d2d]">
                                <div className="relative group/status">
                                    <StatusPill status={task.status} />
                                    <select
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        value={task.status}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onUpdate(task.id, { status: e.target.value });
                                        }}
                                    >
                                        <option value="todo">待办</option>
                                        <option value="in_progress">进行中</option>
                                        <option value="done">已完成</option>
                                    </select>
                                </div>
                            </td>
                            <td className="px-3 py-3">
                                <div className="relative group/priority">
                                    <PriorityPill priority={task.priority} />
                                    <select
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        value={task.priority}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onUpdate(task.id, { priority: e.target.value });
                                        }}
                                    >
                                        <option value="low">低</option>
                                        <option value="medium">中</option>
                                        <option value="high">高</option>
                                    </select>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {tasks.length === 0 && (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    暂无任务
                </div>
            )}
        </div>
    );
}
