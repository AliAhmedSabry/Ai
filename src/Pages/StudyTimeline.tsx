import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

interface Lesson {
    name: string;
    grade: number;
}

interface Subject {
    name: string;
    grade: number;
    lessons: Lesson[];
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function StudyProfile({ onNavigate }: Props) {
    const [age, setAge] = useState("");
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const addSubject = () => {
        setSubjects([...subjects, { name: "", grade: 0, lessons: [] }]);
    };

    const addLesson = (index: number) => {
        const updated = [...subjects];
        updated[index].lessons.push({ name: "", grade: 0 });
        setSubjects(updated);
    };

    const handleSubmit = async () => {
        const res = await fetch("http://localhost:4000/save-study", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                age: Number(age),
                subjects,
            }),
        });

        const data = await res.json();
        alert(data.message);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <button
                onClick={() => onNavigate("dashboard")}
                className="mb-6 flex items-center gap-2"
            >
                <ArrowLeft /> Back
            </button>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Create Study Profile</h1>

                {/* Age */}
                <div className="mb-6">
                    <label className="block mb-2 font-semibold">Your Age</label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

                {/* Subjects */}
                {subjects.map((subject, i) => (
                    <div key={i} className="mb-6 border p-4 rounded-lg">
                        <input
                            placeholder="Subject Name"
                            className="w-full border p-2 mb-2 rounded"
                            value={subject.name}
                            onChange={(e) => {
                                const updated = [...subjects];
                                updated[i].name = e.target.value;
                                setSubjects(updated);
                            }}
                        />

                        <input
                            type="number"
                            placeholder="Subject Grade"
                            className="w-full border p-2 mb-2 rounded"
                            value={subject.grade}
                            onChange={(e) => {
                                const updated = [...subjects];
                                updated[i].grade = Number(e.target.value);
                                setSubjects(updated);
                            }}
                        />

                        {subject.lessons.map((lesson, j) => (
                            <div key={j} className="ml-4 mb-2">
                                <input
                                    placeholder="Lesson Name"
                                    className="border p-2 rounded mr-2"
                                    value={lesson.name}
                                    onChange={(e) => {
                                        const updated = [...subjects];
                                        updated[i].lessons[j].name = e.target.value;
                                        setSubjects(updated);
                                    }}
                                />

                                <input
                                    type="number"
                                    placeholder="Lesson Grade"
                                    className="border p-2 rounded"
                                    value={lesson.grade}
                                    onChange={(e) => {
                                        const updated = [...subjects];
                                        updated[i].lessons[j].grade = Number(e.target.value);
                                        setSubjects(updated);
                                    }}
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => addLesson(i)}
                            className="text-blue-600 flex items-center gap-1 mt-2"
                        >
                            <Plus size={16} /> Add Lesson
                        </button>
                    </div>
                ))}

                <button
                    onClick={addSubject}
                    className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                    Add Subject
                </button>

                <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg w-full"
                >
                    Save Profile
                </button>
            </div>
        </div>
    );
}
