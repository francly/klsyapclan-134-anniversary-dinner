import { useState, useEffect, useRef } from 'react';
import { format, isSameDay, parseISO, isPast, set, isBefore, isAfter, differenceInMinutes, addMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { programData as initialProgramData } from '../data/program';
import { Clock, Plus, Trash2, Play, RotateCcw, Sliders } from 'lucide-react';

const SIMULATION_START = new Date("2026-04-24T00:00:00");
const SIMULATION_END = new Date("2026-04-26T23:59:59");
const TOTAL_MINUTES = differenceInMinutes(SIMULATION_END, SIMULATION_START);

export default function Program() {
    // Mock current time (real-time)
    const [realTime, setRealTime] = useState(new Date());

    // Simulation State
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationProgress, setSimulationProgress] = useState(0); // 0 to 100

    // Derived Display Time
    const displayTime = isSimulating
        ? addMinutes(SIMULATION_START, (simulationProgress / 100) * TOTAL_MINUTES)
        : realTime;

    // Editable Program State
    const [program, setProgram] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingTime, setEditingTime] = useState(null);
    const saveTimeoutRef = useRef(null);

    // Fetch Data on Component Mount
    useEffect(() => {
        fetch('/api/program')
            .then(res => res.json())
            .then(data => {
                setProgram(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load program data", err);
                setIsLoading(false);
                setProgram(initialProgramData); // Fallback
            });
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setRealTime(new Date());
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Countdown Logic (uses displayTime)
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        // Target date for countdown
        const target = new Date("2026-04-24T12:00:00");
        const difference = +target - +displayTime;

        let tl = {};
        if (difference > 0) {
            tl = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return tl;
    }

    // Effect to update countdown availability when displayTime changes
    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
    }, [displayTime]); // Recalculate whenever time changes (real or simulated)

    // Save Data to Server (Debounced)
    const saveProgram = (newData) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            fetch('/api/program', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
            })
                .then(res => res.json())
                .then(data => console.log("Saved:", data))
                .catch(err => console.error("Save failed:", err));
        }, 1000); // 1 second debounce
    };

    const handleEventChange = (dayIndex, eventIndex, field, value) => {
        const newProgram = [...program];
        // Ensure the event object exists
        if (newProgram[dayIndex] && newProgram[dayIndex].events[eventIndex]) {
            newProgram[dayIndex].events[eventIndex] = {
                ...newProgram[dayIndex].events[eventIndex],
                [field]: value
            };
            setProgram(newProgram);
            saveProgram(newProgram);
        }
    };

    const addEvent = (dayIndex) => {
        const newProgram = [...program];
        newProgram[dayIndex].events.push({
            time: "00:00",
            title: "新活动",
            highlight: false
        });
        setProgram(newProgram);
        saveProgram(newProgram);
    };

    const deleteEvent = (dayIndex, eventIndex) => {
        if (window.confirm("确定要删除这个活动吗？")) {
            const newProgram = [...program];
            newProgram[dayIndex].events.splice(eventIndex, 1);
            setProgram(newProgram);
            saveProgram(newProgram);
        }
    };

    const hasTimeLeft = Object.keys(timeLeft).length > 0;

    // Helper to check status using displayTime
    const getEventStatus = (eventDateStr, eventTimeStr) => {
        if (!eventTimeStr || !eventDateStr) return 'future'; // Safe guard
        const [hours, minutes] = eventTimeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return 'future';

        const eventDate = parseISO(eventDateStr);
        const eventDateTime = set(eventDate, { hours, minutes, seconds: 0 });

        if (isBefore(eventDateTime, displayTime)) return 'past';
        return 'future';
    };

    const isToday = (dateStr) => {
        return isSameDay(parseISO(dateStr), displayTime);
    };

    const handleResetSimulation = () => {
        setIsSimulating(false);
        setSimulationProgress(0);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111111] transition-colors p-4 md:p-8 pb-24">
            <div className="max-w-xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4">
                        <Clock className="w-8 h-8 text-blue-500" />
                        活动流程
                    </h1>

                    {/* Countdown Timer */}
                    {hasTimeLeft ? (
                        <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#222] mb-6">
                            <h3 className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium mb-4 uppercase tracking-widest">距离活动开始还有</h3>
                            <div className="flex justify-center gap-4 md:gap-8">
                                {[
                                    { value: timeLeft.days, label: "天" },
                                    { value: timeLeft.hours, label: "时" },
                                    { value: timeLeft.minutes, label: "分" },
                                    { value: timeLeft.seconds, label: "秒" }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="text-3xl md:text-4xl font-bold font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2d2d2d] w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center border border-gray-100 dark:border-[#333] shadow-inner">
                                            {String(item.value).padStart(2, '0')}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2 font-medium">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-center font-bold mb-6">
                            🎉 活动进行中！
                        </div>
                    )}

                    <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isSimulating ? "bg-amber-500" : "bg-green-500"}`}></span>
                        {isSimulating ? "模拟时间" : "当前时间"}: {format(displayTime, "yyyy年MM月dd日 HH:mm:ss", { locale: zhCN })}
                        {isSimulating && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">模拟中</span>}
                    </p>
                </div>

                <div className="space-y-12 pb-24">
                    {program.map((day, dayIndex) => (
                        <div key={dayIndex} className="relative">
                            {/* Date Header */}
                            <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-[#111111]/95 backdrop-blur py-4 mb-4 border-b border-gray-100 dark:border-[#222] flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {format(parseISO(day.date), "dd/MM/yyyy", { locale: zhCN })}
                                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        {format(parseISO(day.date), "EEEE", { locale: zhCN })}
                                    </span>
                                </h2>
                            </div>

                            <div className="relative pl-8 border-l-2 border-gray-200 dark:border-[#333] space-y-6">
                                {day.events.map((event, eventIndex) => {
                                    const status = getEventStatus(day.date, event.time);
                                    const isHighlight = event.highlight;

                                    const containerClass = status === 'past'
                                        ? "opacity-50 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
                                        : "opacity-100 transition-all duration-500";

                                    const inputTimeClass = status === 'past'
                                        ? "text-gray-400 dark:text-gray-600 bg-transparent"
                                        : "text-blue-600 dark:text-blue-400 font-bold bg-transparent";

                                    const inputTitleClass = isHighlight
                                        ? "text-red-600 dark:text-red-400 font-bold text-lg bg-transparent w-full"
                                        : status === 'past'
                                            ? "text-gray-500 dark:text-gray-500 bg-transparent w-full"
                                            : "text-gray-900 dark:text-white font-semibold text-lg bg-transparent w-full";

                                    return (
                                        <div key={eventIndex} className={`relative group ${containerClass}`}>
                                            {/* Dot */}
                                            <div className={`absolute -left-[41px] top-2.5 w-5 h-5 rounded-full border-4 border-gray-50 dark:border-[#111111] z-10 ${isHighlight
                                                ? "bg-red-500"
                                                : status === 'past' ? "bg-gray-300 dark:bg-[#333]" : "bg-blue-500"
                                                }`} />

                                            <div className="flex gap-4 items-start relative px-2 py-1 -ml-2 rounded-lg hover:bg-white dark:hover:bg-[#1f1f1f] hover:shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-[#2d2d2d] transition-all">
                                                {/* Time Display/Input (Click-to-Edit) */}
                                                {editingTime?.dayIndex === dayIndex && editingTime?.eventIndex === eventIndex ? (
                                                    <input
                                                        type="time"
                                                        autoFocus
                                                        value={event.time}
                                                        onChange={(e) => handleEventChange(dayIndex, eventIndex, 'time', e.target.value)}
                                                        onBlur={() => setEditingTime(null)}
                                                        className={`w-28 shrink-0 text-right font-mono focus:ring-2 focus:ring-blue-500 rounded px-1 outline-none text-gray-900 dark:text-white bg-white dark:bg-[#111] border border-blue-500`}
                                                    />
                                                ) : (
                                                    <div
                                                        onClick={() => setEditingTime({ dayIndex, eventIndex })}
                                                        className={`w-28 shrink-0 text-right font-mono cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] rounded px-1 py-0.5 ${inputTimeClass}`}
                                                    >
                                                        {(() => {
                                                            if (!event.time) return "--:--";
                                                            const [h, m] = event.time.split(':');
                                                            const d = new Date();
                                                            d.setHours(h);
                                                            d.setMinutes(m);
                                                            return format(d, "hh:mm aa");
                                                        })()}
                                                    </div>
                                                )}

                                                {/* Title Input */}
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        type="text"
                                                        value={event.title}
                                                        onChange={(e) => handleEventChange(dayIndex, eventIndex, 'title', e.target.value)}
                                                        className={`focus:ring-2 focus:ring-blue-500 rounded px-1 outline-none ${inputTitleClass}`}
                                                        placeholder="输入活动名称..."
                                                    />
                                                    {event.subtitle && (
                                                        <div className={`mt-1 text-sm ${event.subtitleHighlight
                                                            ? "text-red-500 dark:text-red-400 font-medium"
                                                            : "text-gray-500 dark:text-gray-400"
                                                            }`}>
                                                            {event.subtitle}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => deleteEvent(dayIndex, eventIndex)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all absolute right-2 top-1.5 bg-white dark:bg-[#1f1f1f] shadow-sm rounded-md border border-gray-200 dark:border-[#333]"
                                                    title="删除活动"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add Event Button */}
                                <button
                                    onClick={() => addEvent(dayIndex)}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-500 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors w-full border border-dashed border-gray-200 dark:border-[#2d2d2d] hover:border-blue-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    添加行程
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className='pt-12 text-center text-gray-400 text-sm'>
                        <p>行程结束</p>
                    </div>
                </div>

                {/* Simulation Controls - Sticky Bottom */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 dark:bg-[#222]/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 border border-gray-100 dark:border-[#333] z-50 transition-all hover:scale-105">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${isSimulating ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                                    <Sliders className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm text-gray-700 dark:text-gray-200">
                                    {isSimulating ? "时间穿梭模式" : "实时模式"}
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    setIsSimulating(!isSimulating);
                                    if (!isSimulating) setSimulationProgress(0);
                                }}
                                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${isSimulating
                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                                    : "bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-gray-400 hover:bg-gray-200"
                                    }`}
                            >
                                {isSimulating ? "退出模拟" : "进入模拟"}
                            </button>
                        </div>

                        {isSimulating && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={simulationProgress}
                                    onChange={(e) => setSimulationProgress(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400 font-mono">
                                    <span>{format(SIMULATION_START, "MM/dd HH:mm")}</span>
                                    <span className="text-amber-600 font-bold">{format(displayTime, "MM/dd HH:mm")}</span>
                                    <span>{format(SIMULATION_END, "MM/dd HH:mm")}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
