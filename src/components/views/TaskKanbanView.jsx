import { CheckCircle2, Circle, MoreHorizontal, Plus } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function TaskKanbanView({ tasks, onTaskClick, onUpdate }) {
    const columns = [
        { id: "todo", title: "待办", color: "bg-blue-500" },
        { id: "in_progress", title: "进行中", color: "bg-[#fdab3d]" }, // Custom status we might simulate
        { id: "done", title: "已完成", color: "bg-[#00c875]" },
    ];

    // Helper to categorize tasks
    // Since we only have 'todo' and 'done' in data model, we'll map simplified logic:
    // Todo = todo
    // Done = done
    // For "In Progress", we might need a new status in the future, but for now let's just use 2 columns or simulate it?
    // User asked for Kanban, usually 3 cols. Let's stick to Todo/Done first or check if we want to add 'in_progress' to data model?
    // The data model in TaskContext initializes status to 'todo'.
    // Let's assume 'todo' tasks are in "待办", 'done' are in "已完成". 
    // Maybe we can assume if it has assignees or due date it is "In Progress"? 
    // Or better, let's just stick to the actual status values: 'todo' and 'done' for now to avoid confusion, 
    // OR update the data model to allow 'in_progress'. 
    // Let's stick to 2 columns for data integrity, OR adding a fake column empty for now. 
    // Actually, Plaky screenshot shows multiple statuses. 
    // Let's render 3 columns but 'In Progress' will be empty unless we change data.
    // Wait, let's map 'todo' -> '待办'. 'done' -> '已完成'.

    const getTasksByStatus = (statusId) => {
        return tasks.filter(t => t.status === statusId);
    };

    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white dark:bg-[#111111] p-6">
            <div className="flex h-full gap-6">
                {columns.map(col => (
                    <div key={col.id} className="flex-col flex w-80 shrink-0">
                        {/* Plaky Style Colored Header */}
                        <div className={`flex items-center justify-between px-4 py-2 rounded-t-lg mb-2 ${col.color.replace("bg-", "bg-opacity-90 bg-")} text-white shadow-sm`}>
                            <span className="font-semibold text-sm">{col.title} / {getTasksByStatus(col.id).length}</span>
                            <MoreHorizontal className="w-4 h-4 opacity-70 cursor-pointer hover:opacity-100" />
                        </div>

                        {/* Column Content */}
                        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                            {getTasksByStatus(col.id).map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => onTaskClick(task.id)}
                                    className="bg-white dark:bg-[#1e1e1e] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[#333] hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer group transition-all flex flex-col gap-3"
                                >
                                    {/* Card Header: Group/Ref (simulated) */}
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        {task.description && task.description.includes("Auto-generated") ? "General" : "Task"}
                                    </div>

                                    {/* Title */}
                                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-snug">
                                        {task.title}
                                    </div>

                                    {/* Meta Row: Assignee & Due Date */}
                                    <div className="flex items-center justify-between mt-1">
                                        {/* Assignees Avatar Stack */}
                                        <div className="flex -space-x-2">
                                            {task.assignees && task.assignees.slice(0, 3).map((assignee, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-[#1e1e1e] text-white font-bold" title={assignee}>
                                                    {assignee.charAt(0)}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Date Tag */}
                                        {task.dueDate && (
                                            <div className={`px-2 py-1 rounded text-[10px] font-medium border ${new Date(task.dueDate) < new Date() && task.status !== 'done'
                                                ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                                                : "bg-gray-50 text-gray-600 border-gray-100 dark:bg-[#2d2d2d] dark:text-gray-400 dark:border-[#333]"
                                                }`}>
                                                {format(new Date(task.dueDate), "MMM d")}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Footer (Only visible on hover) */}
                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-gray-100 dark:border-[#2d2d2d]">
                                        {col.id === 'todo' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: 'in_progress' }); }}
                                                className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            >
                                                Start
                                            </button>
                                        )}
                                        {col.id === 'in_progress' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: 'done' }); }}
                                                className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                                            >
                                                Done
                                            </button>
                                        )}
                                        {col.id === 'done' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: 'todo' }); }}
                                                className="text-xs text-gray-600 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                                            >
                                                Reopen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Empty State / Drop Area placeholder */}
                            <div className="h-16 rounded-lg border-2 border-dashed border-gray-100 dark:border-[#2d2d2d] flex items-center justify-center text-gray-400 text-xs">
                                + Add Item
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
