import { X, Calendar, User, Flag, CheckCircle2, Circle, Trash2, Sun, Bell, Repeat, Tag, Paperclip, Plus, Send, Check } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "../lib/utils";
import { useState, useRef, useEffect } from "react";
import DatePickerPopover from "./ui/DatePickerPopover";

export default function TaskDetailPanel({ task, onClose, onUpdate, onDelete, onAddComment, committee = [] }) {
    const [commentText, setCommentText] = useState("");
    const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const assigneeRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (assigneeRef.current && !assigneeRef.current.contains(event.target)) {
                setIsAssigneeOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!task) return null;

    const handleSendComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onAddComment(task.id, commentText);
        setCommentText("");
    };

    const taskAssignees = task.assignees || (task.assignee ? [task.assignee] : []);

    const toggleAssignee = (member) => {
        const current = taskAssignees;
        const updated = current.includes(member)
            ? current.filter(m => m !== member)
            : [...current, member];

        // Update both fields for compatibility, but prefer assignees
        onUpdate(task.id, {
            assignees: updated,
            assignee: updated.length > 0 ? updated[0] : "" // Fallback for legacy views
        });
    };

    const ActionRow = ({ icon: Icon, label, value, onClick, active, children }) => (
        <div className="relative">
            <button
                onClick={onClick}
                className={cn(
                    "w-full flex items-center px-4 py-3 text-sm transition-colors border-b border-gray-100 dark:border-[#2d2d2d] last:border-0",
                    active ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-[#2d2d2d]" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#2d2d2d]"
                )}
            >
                <Icon className={cn("w-5 h-5 mr-4", active ? "text-blue-600 dark:text-blue-400" : "text-gray-400")} />
                <span className="flex-1 text-left">{value || label}</span>
                {value && <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-white" onClick={(e) => { e.stopPropagation(); onClick(null); }} />}
            </button>
            {children}
        </div>
    );

    return (
        <div className="w-full md:w-80 bg-white dark:bg-[#1f1f1f] border-l border-gray-200 dark:border-[#2d2d2d] h-full flex flex-col shadow-xl z-20 absolute md:static right-0 top-0 bottom-0 transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2d2d2d]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            // Cycle: todo -> in_progress -> done -> todo
                            const nextStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
                            onUpdate(task.id, { status: nextStatus });
                        }}
                        className={cn(
                            "transition-colors",
                            task.status === "done" ? "text-green-600 dark:text-green-500" : task.status === "in_progress" ? "text-orange-500" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        )}
                        title="Click to cycle status"
                    >
                        {task.status === "done" ? <CheckCircle2 className="w-6 h-6" /> : task.status === "in_progress" ? <Circle className="w-6 h-6 border-4" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <input
                        type="text"
                        value={task.title}
                        onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                        className="bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500 w-full"
                        placeholder="任务标题"
                    />
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col">
                    {/* Add to My Day */}
                    <ActionRow
                        icon={Sun}
                        label="添加到我的一天"
                        active={false}
                        onClick={() => { }}
                    />
                </div>



                <div className="mt-2 flex flex-col border-t border-gray-100 dark:border-[#2d2d2d]">
                    {/* Remind Me */}
                    <ActionRow icon={Bell} label="提醒我" onClick={() => { }} />

                    {/* Due Date */}
                    <div className="relative">
                        <ActionRow
                            icon={Calendar}
                            label="添加截止日期"
                            value={task.dueDate ? format(new Date(task.dueDate), "yyyy年MM月dd日", { locale: zhCN }) : null}
                            onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                        />
                        {isDatePopoverOpen && (
                            <div className="absolute top-10 left-4 z-50">
                                <DatePickerPopover
                                    onClose={() => setIsDatePopoverOpen(false)}
                                    onSelect={(date) => {
                                        onUpdate(task.id, { dueDate: date.toISOString() });
                                        setIsDatePopoverOpen(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Repeat */}
                    <ActionRow icon={Repeat} label="重复" onClick={() => { }} />
                </div>

                <div className="mt-2 flex flex-col border-t border-gray-100 dark:border-[#2d2d2d]">
                    {/* Assign To (Multiple) */}
                    <div className="relative" ref={assigneeRef}>
                        <ActionRow
                            icon={User}
                            label="分配给..."
                            value={taskAssignees.length > 0 ? taskAssignees.join(", ") : null}
                            onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                        />
                        {isAssigneeOpen && (
                            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] shadow-lg z-50 max-h-60 overflow-y-auto">
                                {committee.map(group => (
                                    <div key={group.role}>
                                        <div className="px-4 py-1 text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-[#2d2d2d] sticky top-0">{group.role}</div>
                                        {group.members.map(member => {
                                            const isSelected = taskAssignees.includes(member);
                                            return (
                                                <button
                                                    key={member}
                                                    onClick={() => toggleAssignee(member)}
                                                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200"
                                                >
                                                    <span>{member}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-2 flex flex-col border-t border-gray-100 dark:border-[#2d2d2d]">
                    {/* Status Selector */}
                    <div className="relative">
                        <ActionRow
                            icon={CheckCircle2}
                            label="状态"
                            value={task.status === 'done' ? "已完成" : task.status === 'in_progress' ? "进行中" : "待办"}
                            onClick={() => { }}
                            active={task.status !== 'todo'}
                        />
                        <select
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={task.status}
                            onChange={(e) => onUpdate(task.id, { status: e.target.value })}
                        >
                            <option value="todo">待办</option>
                            <option value="in_progress">进行中</option>
                            <option value="done">已完成</option>
                        </select>
                    </div>

                    {/* Priority (Category) */}
                    <div className="relative">
                        <ActionRow
                            icon={Tag}
                            label="选择类别 (优先级)"
                            value={task.priority === "high" ? "高优先级" : task.priority === "medium" ? "中优先级" : "低优先级"}
                            onClick={() => { }}
                        />
                        <select
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={task.priority}
                            onChange={(e) => onUpdate(task.id, { priority: e.target.value })}
                        >
                            <option value="low">低优先级</option>
                            <option value="medium">中优先级</option>
                            <option value="high">高优先级</option>
                        </select>
                    </div>

                    {/* Add File */}
                    <ActionRow icon={Paperclip} label="添加文件" onClick={() => { }} />
                </div>

                <div className="mt-2 p-4 border-t border-gray-100 dark:border-[#2d2d2d]">
                    <textarea
                        value={task.description}
                        onChange={(e) => onUpdate(task.id, { description: e.target.value })}
                        className="w-full bg-transparent text-gray-700 dark:text-gray-300 border-none focus:ring-0 p-0 resize-none placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        rows={4}
                        placeholder="添加备注..."
                    />
                </div>

                {/* Comments Section */}
                <div className="mt-2 p-4 border-t border-gray-100 dark:border-[#2d2d2d]">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">进展反馈</h3>
                    <div className="space-y-3 mb-4">
                        {task.comments && task.comments.map(comment => (
                            <div key={comment.id} className="bg-gray-50 dark:bg-[#2d2d2d] p-3 rounded-lg">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{comment.text}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500">{comment.author}</span>
                                    <span className="text-xs text-gray-400">{format(new Date(comment.createdAt), "MM/dd HH:mm")}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendComment} className="relative">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-200 dark:border-[#333] rounded-full py-2 pl-4 pr-10 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="添加反馈..."
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="absolute right-1 top-1 p-1.5 text-blue-600 dark:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-[#333] rounded-full transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-[#2d2d2d] flex justify-between items-center text-xs text-gray-500 bg-gray-50 dark:bg-[#1f1f1f]">
                <span>创建于 {format(new Date(task.createdAt), "MM月dd日", { locale: zhCN })}</span>
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-2 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-500 dark:hover:bg-[#2d2d2d] rounded transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
