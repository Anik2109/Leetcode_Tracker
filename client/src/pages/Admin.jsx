import { useState } from "react";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import ConfirmModal from "../components/Confirmation/confirm.jsx";
import Editor from "@monaco-editor/react";

export default function Admin() {
  const [fetchedPlan, setFetchedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    user: "",
    action: "view",       // add | remove | delete | replace | rename | view
    title: "",
    newName: "",
    questions: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Parse the questions textarea into an array
  const parsedQuestions = (form.questions || "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);

  // Always include topics in JSON; for rename include newName
  const jsonOutput = {
    action: form.action,
    ...(form.action === "rename" && form.newName && { newName: form.newName }),
    topics: [
      {
        title: form.title,
        ...(form.action !== "rename" && form.action !== "view" && {
          questions: parsedQuestions,
        }),
      },
    ],
  };

  // Mapping for user to ID
  const userIdMap = {
    cutiee: "6871e25ad20232314527a50b",
    babygirl: "6873fa0943fbf04d5631aec8",
  };

  const handleSubmit = () => {
    setConfirmAction(() => handleSubmitConfirmed);
    setConfirmMessage("Are you sure you want to perform this action?");
    setShowConfirm(true);
  };

  const handleSubmitConfirmed = async () => {
    const userId = userIdMap[form.user.toLowerCase()];
    if (!userId) return toast.error("Please select a valid user.");

    setLoading(true);
    try {
      if (form.action === "view") {
        const { data } = await API.get(`/studyplan/${userId}`);
        toast.success("Fetched successfully!");
        setFetchedPlan(data.topics);
        document.getElementById("outputPanel")?.scrollIntoView({ behavior: "smooth" });
      } else {
        await API.patch(`/studyplan/${userId}`, jsonOutput);
        toast.success("Action completed successfully!");
        setFetchedPlan(null);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmAction(() => handleDeleteConfirmed);
    setConfirmMessage("Are you sure you want to delete this study plan?");
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    const userId = userIdMap[form.user.toLowerCase()];
    if (!userId) return toast.error("Please select a valid user.");

    setLoading(true);
    try {
      await API.delete(`/studyplan/${userId}`);
      toast.success("Study plan deleted successfully!");
      setFetchedPlan(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-[#0f0f1c] min-h-screen text-white">
      <Toaster position="top-right" />
      {/* ===== Left: Form ===== */}
      <div className="w-full lg:w-1/2 space-y-6">
        <h1 className="text-2xl font-bold">Study Plan Editor</h1>

        {/* User */}
        <div>
          <label className="block mb-1 text-sm text-gray-300">User</label>
          <select
            name="user"
            value={form.user}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
          >
            <option value="cutiee">Cutiee</option>
            <option value="babygirl">Babygirl</option>
          </select>
        </div>

        {/* Action Type */}
        <div>
          <label className="block mb-1 text-sm text-gray-300">Action Type</label>
          <select
            name="action"
            value={form.action}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
          >
            <option value="view">View</option>
            <option value="add">Add</option>
            <option value="remove">Remove</option>
            <option value="delete">Delete</option>
            <option value="replace">Replace</option>
            <option value="rename">Rename</option>
          </select>
        </div>

        {/* Title (hidden for view) */}
        {form.action !== "view" && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter topic title"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
            />
          </div>
        )}

        {/* New Name (only for rename) */}
        {form.action === "rename" && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">New Name</label>
            <input
              type="text"
              name="newName"
              value={form.newName}
              onChange={handleChange}
              placeholder="Enter new topic name"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
            />
          </div>
        )}

        {/* Questions (hidden for rename & view) */}
        {form.action !== "rename" && form.action !== "view" && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Questions (one per line)
            </label>
            <textarea
              name="questions"
              value={form.questions}
              onChange={handleChange}
              placeholder="Enter questions here..."
              rows={6}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-white text-black py-2 rounded-md hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Submit"}
        </button>

        {/* Delete Button for 'view' */}
        {form.action === "view" && (
            <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full mt-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Processing..." : "Delete"}
          </button>
        )}
      </div>

      {/* ===== Right: JSON Output ===== */}
        <div id="outputPanel" className="w-full lg:w-1/2">
            <h2 className="text-xl font-semibold mb-2">
                {form.action === "view" ? "Fetched Study Plan" : "JSON Output"}
            </h2>
            <Editor
                height="400px"
                theme="vs-dark"
                language="json"
                value={
                    form.action === "view"
                    ? JSON.stringify(fetchedPlan, null, 2)
                    : JSON.stringify(jsonOutput, null, 2)
                }
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    wordWrap: "on",
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                }}
            />
            {form.action === "view" && fetchedPlan && (
              <div className="mt-6 bg-gray-800 p-4 rounded-md">
                {fetchedPlan.map((topic, idx) => (
                  <div key={idx} className="mb-4">
                    <h3 className="text-orange-400 font-semibold text-lg mb-1">{topic.title}</h3>
                    <ul className="list-disc list-inside text-green-300 text-sm">
                      {topic.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
         </div>
         <ConfirmModal
           isOpen={showConfirm}
           onClose={() => setShowConfirm(false)}
           onConfirm={confirmAction}
           message={confirmMessage}
         />
    </div>
  );
}