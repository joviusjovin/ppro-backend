import React from "react";

// Define the type for the project prop
interface Project {
  title: string;
  description: string;
  technologies: string[];
}

// Define the props for the PopupForm component
interface PopupFormProps {
  project: Project | null;
  onClose: () => void;
}

const PopupForm: React.FC<PopupFormProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 dark:bg-[#001c26] dark:bg-opacity-80">
      <div className="bg-white p-8 rounded-lg w-11/12 max-w-2xl dark:bg-[#001c26]">
        {/* Project Details */}
        <h2 className="text-2xl font-bold mb-4 dark:text-white">{project.title}</h2>
        <p className="text-gray-600 mb-4 dark:text-white">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech, techIndex) => (
            <span
              key={techIndex}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm dark:text-gray-600"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Form for User Input */}
        <form className="space-y-4">
         
        </form>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PopupForm;