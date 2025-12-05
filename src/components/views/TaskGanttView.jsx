import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek, endOfMonth, isSameDay, isSameWeek, isSameMonth, differenceInMilliseconds, min, max } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";
import { ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";

const VIEW_MODES = {
    DAY: { id: 'day', label: '日', width: 50, labelFormat: 'd' },
    WEEK: { id: 'week', label: '周', width: 100, labelFormat: 'wo' },
    MONTH: { id: 'month', label: '月', width: 120, labelFormat: 'MMM' },
};

export default function TaskGanttView({ tasks, onTaskClick }) {
    const [viewMode, setViewMode] = useState('day');
    const [currentDate, setCurrentDate] = useState(new Date());

    // 1. Prepare Data
    const datedTasks = tasks.filter(t => t.dueDate || t.startDate).sort((a, b) => {
        const startA = a.startDate ? new Date(a.startDate) : (a.createdAt ? new Date(a.createdAt) : new Date());
        const startB = b.startDate ? new Date(b.startDate) : (b.createdAt ? new Date(b.createdAt) : new Date());
        return startA - startB;
    });

    // 2. Determine Timeline Range
    let minDate = addDays(new Date(), -14); // Default start 2 weeks ago
    let maxDate = addDays(new Date(), 45);  // Default end 1.5 months ahead

    if (datedTasks.length > 0) {
        const startDates = datedTasks.map(t => t.startDate ? new Date(t.startDate) : (t.createdAt ? new Date(t.createdAt) : new Date()));
        const dueDates = datedTasks.map(t => t.dueDate ? new Date(t.dueDate) : new Date());

        const earliest = min(startDates);
        const latest = max(dueDates);

        // Add padding based on view mode
        if (viewMode === 'day') {
            minDate = addDays(earliest, -3);
            maxDate = addDays(latest, 7);
        } else if (viewMode === 'week') {
            minDate = addWeeks(startOfWeek(earliest), -1);
            maxDate = addWeeks(endOfWeek(latest), 2);
        } else {
            minDate = addMonths(startOfMonth(earliest), -1);
            maxDate = addMonths(endOfMonth(latest), 2);
        }
    }

    // 3. Generate Grid Columns
    let columns = [];
    if (viewMode === 'day') {
        columns = eachDayOfInterval({ start: minDate, end: maxDate });
    } else if (viewMode === 'week') {
        columns = eachWeekOfInterval({ start: minDate, end: maxDate });
    } else {
        columns = eachMonthOfInterval({ start: minDate, end: maxDate });
    }

    // 4. Helper for Positioning
    const getPositionAndWidth = (task) => {
        const start = task.startDate ? new Date(task.startDate) : (task.createdAt ? new Date(task.createdAt) : addDays(new Date(task.dueDate), -3));
        const end = task.dueDate ? new Date(task.dueDate) : new Date();

        // Ensure valid range
        if (start > end) return { left: 0, width: 0 };

        const totalRangeMs = differenceInMilliseconds(maxDate, minDate);
        const startOffsetMs = differenceInMilliseconds(start, minDate);
        const durationMs = differenceInMilliseconds(end, start);

        // Calculate based on columns loop? No, that's rigid. 
        // Better: linear projection based on milliseconds to pixels.

        // Calculate total width of the timeline
        const mode = VIEW_MODES[viewMode.toUpperCase()];
        const totalPixels = columns.length * mode.width;

        // How many MS does the grid cover?
        // Note: columns are just ticks. The visual representation must match the ticks.
        // Day: 1 tick = 1 day
        // Week: 1 tick = 1 week
        // Month: 1 tick = 1 month (variable length!)
        // This makes linear ms projection tricky for Month view.

        // Alternative: Calculate position relative to the specific column it falls into?
        // Too complex for now. Let's use simplified linear assumption for Week/Day, and average for Month?
        // Or simply:
        // Day view: diffDays(date, min) * width
        // Week view: diffWeeks(date, min) * width (using float diff)
        // Month view: diffMonths(date, min) * width (using float diff)

        let offsetUnits = 0;
        let durationUnits = 0;

        if (viewMode === 'day') {
            const msPerDay = 1000 * 60 * 60 * 24;
            offsetUnits = startOffsetMs / msPerDay;
            durationUnits = durationMs / msPerDay;
        } else if (viewMode === 'week') {
            const msPerWeek = 1000 * 60 * 60 * 24 * 7;
            offsetUnits = startOffsetMs / msPerWeek;
            durationUnits = durationMs / msPerWeek;
        } else {
            // Month is separate because length varies. 
            // Simple approximation: 30.44 days
            const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;
            offsetUnits = startOffsetMs / msPerMonth;
            durationUnits = durationMs / msPerMonth;
        }

        return {
            left: Math.max(0, offsetUnits * mode.width),
            width: Math.max(4, durationUnits * mode.width) // Min 4px
        };
    };

    const currentSettings = VIEW_MODES[viewMode.toUpperCase()];
    const today = new Date();

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111111] overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-[#333] shrink-0 bg-white dark:bg-[#1f1f1f]">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Zoom:</span>
                    <div className="flex bg-gray-100 dark:bg-[#2d2d2d] rounded-md p-1">
                        {Object.values(VIEW_MODES).map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setViewMode(mode.id)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                                    viewMode === mode.id
                                        ? "bg-white dark:bg-[#444] text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                )}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Legend or other controls could go here */}
            </div>

            {/* Gantt Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar (Task List) */}
                <div className="w-64 shrink-0 flex flex-col border-r border-gray-200 dark:border-[#333] bg-white dark:bg-[#1f1f1f]">
                    <div className="h-10 border-b border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#252525] px-4 flex items-center text-xs font-semibold text-gray-500">
                        任务 ({datedTasks.length})
                    </div>
                    <div className="flex-1 overflow-y-hidden hover:overflow-y-auto scrollbar-hide">
                        {/* We need to sync scroll with the chart. 
                            Actually, simple layout: Put sidebar AND chart in same scroll container? 
                            No, sidebar usually stays fixed horizontally. 
                            Let's use a common container for rows.
                        */}
                        <div className="flex flex-col">
                            {datedTasks.map(task => (
                                <div key={task.id} className="h-10 px-4 flex items-center gap-2 border-b border-gray-100 dark:border-[#2d2d2d] group hover:bg-gray-50 dark:hover:bg-[#2d2d2d] cursor-pointer" onClick={() => onTaskClick(task.id)}>
                                    <div className={cn("w-2 h-2 rounded-full", task.status === 'done' ? "bg-green-500" : task.priority === 'high' ? "bg-red-500" : task.priority === 'medium' ? "bg-orange-500" : "bg-blue-500")} />
                                    <span className="text-xs truncate text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{task.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline Chart */}
                <div className="flex-1 overflow-auto relative custom-scrollbar">
                    <div className="min-w-fit h-full flex flex-col">
                        {/* Header Row */}
                        <div className="h-10 flex bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-[#333] sticky top-0 z-20 w-max">
                            {columns.map((col, index) => {
                                const isCurrent = viewMode === 'day' ? isSameDay(col, today) : viewMode === 'week' ? isSameWeek(col, today) : isSameMonth(col, today);
                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "shrink-0 border-r border-gray-200 dark:border-[#333] flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-medium",
                                            isCurrent && "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
                                        )}
                                        style={{ width: currentSettings.width }}
                                    >
                                        {viewMode === 'day' && format(col, 'd MMM')}
                                        {viewMode === 'week' && `W${format(col, 'w')}`}
                                        {viewMode === 'month' && format(col, 'MMM yyyy')}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chart Body */}
                        <div className="flex-1 w-max relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex pointer-events-none z-0">
                                {columns.map((col, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "shrink-0 border-r border-gray-100 dark:border-[#2d2d2d] h-full",
                                            (viewMode === 'day' ? isSameDay(col, today) : viewMode === 'week' ? isSameWeek(col, today) : isSameMonth(col, today)) && "bg-blue-50/10 dark:bg-blue-500/5"
                                        )}
                                        style={{ width: currentSettings.width }}
                                    />
                                ))}
                            </div>

                            {/* Task Rows */}
                            <div className="flex flex-col z-10 relative">
                                {datedTasks.map(task => {
                                    const { left, width } = getPositionAndWidth(task);
                                    return (
                                        <div key={task.id} className="h-10 border-b border-transparent relative group">
                                            {/* Bar */}
                                            <div
                                                className={cn(
                                                    "absolute top-2 h-6 rounded-full shadow-sm flex items-center px-3 text-[10px] text-white whitespace-nowrap overflow-hidden transition-all hover:brightness-110 cursor-pointer",
                                                    task.status === 'done' ? "bg-green-500 opacity-60" : "bg-blue-500"
                                                )}
                                                style={{ left: `${left}px`, width: `${width}px` }}
                                                onClick={() => onTaskClick(task.id)}
                                                title={`${task.title} (${task.dueDate})`}
                                            >
                                                {width > 30 && <span className="drop-shadow-sm">{task.title}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
