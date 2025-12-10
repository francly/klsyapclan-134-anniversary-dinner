import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { committee } from "../data/committee";
import { taskTemplates } from "../data/taskTemplates";
import { addDays } from "date-fns";

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);

    // Load tasks from server on mount
    useEffect(() => {
        fetch('/api/tasks')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTasks(data);
                }
            })
            .catch(err => console.error("Failed to load tasks:", err));
    }, []);

    // Helper to save to server
    const saveToServer = (newTasks) => {
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTasks),
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) console.error("Failed to save tasks:", data.error);
            })
            .catch(err => console.error("Error saving tasks:", err));
    };

    const addTask = (task) => {
        const newTask = {
            ...task,
            id: uuidv4(),
            dueDate: task.dueDate || "",
            priority: task.priority || "medium",
            status: "todo",
            assignees: task.assignees || (task.assignee ? [task.assignee] : []),
            createdAt: new Date().toISOString(),
            startDate: task.startDate || new Date().toISOString(),
            comments: [],
        };

        const newTaskList = [newTask, ...tasks];
        setTasks(newTaskList);
        saveToServer(newTaskList);
    };

    const updateTask = (id, updates) => {
        const newTaskList = tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
        setTasks(newTaskList);
        saveToServer(newTaskList);
    };

    const deleteTask = (id) => {
        const newTaskList = tasks.filter((task) => task.id !== id);
        setTasks(newTaskList);
        saveToServer(newTaskList);
    };

    const addComment = (taskId, text) => {
        const newComment = {
            id: uuidv4(),
            text,
            author: "Current User",
            createdAt: new Date().toISOString(),
        };
        const newTaskList = tasks.map((task) =>
            task.id === taskId
                ? { ...task, comments: [...(task.comments || []), newComment] }
                : task
        );
        setTasks(newTaskList);
        saveToServer(newTaskList);
    };

    const clearAllTasks = () => {
        const newTaskList = [];
        setTasks(newTaskList);
        saveToServer(newTaskList);
    };

    const generateTasks = (dinnerDate) => {
        const newGeneratedTasks = [];
        const dateObj = new Date(dinnerDate);

        committee.forEach((group) => {
            const templates = taskTemplates[group.role];
            if (templates) {
                templates.forEach((template) => {
                    const assignee = group.members[0];
                    newGeneratedTasks.push({
                        id: uuidv4(),
                        title: template.title,
                        description: `Auto-generated task for ${group.role}`,
                        status: "todo",
                        priority: template.priority,
                        dueDate: addDays(dateObj, template.daysOffset).toISOString(),
                        startDate: addDays(dateObj, template.daysOffset - (template.duration || 1)).toISOString(),
                        assignees: [assignee],
                        assignee: assignee,
                        createdAt: new Date().toISOString(),
                        comments: []
                    });
                });
            }
        });

        // Use newGeneratedTasks directly, ensuring we replace existing (or clear and add new?)
        // The previous implementation replaced all tasks. We will stick to that behavior.
        setTasks(newGeneratedTasks);
        saveToServer(newGeneratedTasks);
    };

    const getProjectStatus = () => {
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
