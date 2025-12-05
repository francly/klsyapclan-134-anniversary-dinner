import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { committee } from "../data/committee";
import { taskTemplates } from "../data/taskTemplates";
import { addDays } from "date-fns";

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem("tasks");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (task) => {
        const newTask = {
            ...task,
            id: uuidv4(),
            dueDate: task.dueDate || "",
            priority: task.priority || "medium",
            status: "todo",
            assignees: task.assignees || (task.assignee ? [task.assignee] : []), // Support multiple assignees, fallback to single
            createdAt: new Date().toISOString(),
            startDate: task.startDate || new Date().toISOString(), // Use provided start date or now
            comments: [], // Initialize comments array
        };
        setTasks((prev) => [newTask, ...prev]);
    };

    const updateTask = (id, updates) => {
        setTasks((prev) =>
            prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
        );
    };

    const deleteTask = (id) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const addComment = (taskId, text) => {
        const newComment = {
            id: uuidv4(),
            text,
            author: "Current User", // Placeholder for now
            createdAt: new Date().toISOString(),
        };
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? { ...task, comments: [...(task.comments || []), newComment] }
                    : task
            )
        );
    };

    const clearAllTasks = () => {
        setTasks([]);
    };

    const generateTasks = (dinnerDate) => {
        const newTasks = [];
        const dateObj = new Date(dinnerDate);

        committee.forEach((group) => {
            const templates = taskTemplates[group.role];
            if (templates) {
                templates.forEach((template) => {
                    // Distribute tasks among members of the group
                    // For simplicity, assign to the first member, or rotate if we wanted to be fancy
                    // Let's assign to the first member for now to ensure ownership
                    const assignee = group.members[0];

                    newTasks.push({
                        id: uuidv4(),
                        title: template.title,
                        description: `Auto-generated task for ${group.role}`,
                        status: "todo",
                        priority: template.priority,
                        dueDate: addDays(dateObj, template.daysOffset).toISOString(),
                        startDate: addDays(dateObj, template.daysOffset - (template.duration || 1)).toISOString(), // Calculate start date
                        assignees: [assignee],
                        assignee: assignee, // Legacy support
                        createdAt: new Date().toISOString(),
                        comments: []
                    });
                });
            }
        });

        setTasks(newTasks);
    };

    const getProjectStatus = () => {
        // Logic: Red if any high priority task is overdue or if > 20% of tasks are overdue.
        // For now, simple logic: Red if any task is overdue.
        const overdueTasks = tasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
        );

        if (overdueTasks.length > 0) return "red";
        return "green";
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                updateTask,
                deleteTask,
                addComment,
                getProjectStatus,
                clearAllTasks,
                generateTasks
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};
