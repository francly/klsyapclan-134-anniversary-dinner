import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Timeline from "./pages/Timeline";
import Team from "./pages/Team";
import Program from "./pages/Program";
import { TaskProvider } from "./context/TaskContext";

export default function App() {
  return (
    <TaskProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
            <Route path="/timeline" element={<Layout><Timeline /></Layout>} />
            <Route path="/program" element={<Layout><Program /></Layout>} />
            <Route path="/team" element={<Layout><Team /></Layout>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </TaskProvider>
  );
}
