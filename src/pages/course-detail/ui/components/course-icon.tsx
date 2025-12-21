import { FC } from "react";

interface CourseIconProps {
  title: string;
  category?: string;
}

const getCourseIcon = (title: string, category?: string): string => {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category?.toLowerCase() || "";

  if (lowerTitle.includes("git") || lowerCategory.includes("git")) {
    return "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png";
  }
  if (
    lowerTitle.includes("docker") ||
    lowerCategory.includes("docker") ||
    lowerCategory.includes("container")
  ) {
    return "https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png";
  }
  if (
    lowerTitle.includes("kubernetes") ||
    lowerTitle.includes("k8s") ||
    lowerCategory.includes("kubernetes")
  ) {
    return "https://kubernetes.io/images/kubernetes-horizontal-color.png";
  }
  if (lowerTitle.includes("python") || lowerCategory.includes("python")) {
    return "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg";
  }
  if (
    lowerTitle.includes("javascript") ||
    lowerTitle.includes("js") ||
    lowerCategory.includes("javascript")
  ) {
    return "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png";
  }
  if (lowerTitle.includes("react") || lowerCategory.includes("react")) {
    return "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg";
  }
  if (lowerTitle.includes("aws") || lowerCategory.includes("aws")) {
    return "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg";
  }
  if (lowerTitle.includes("linux") || lowerCategory.includes("linux")) {
    return "https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg";
  }
  if (lowerTitle.includes("node") || lowerCategory.includes("node")) {
    return "https://nodejs.org/static/images/logo.svg";
  }
  if (lowerTitle.includes("java") || lowerCategory.includes("java")) {
    return "https://www.oracle.com/a/tech/img/cb88-java-logo-001.jpg";
  }
  if (lowerTitle.includes("terraform") || lowerCategory.includes("terraform")) {
    return "https://www.datocms-assets.com/2885/1629941242-logo-terraform-main.svg";
  }
  if (lowerTitle.includes("ansible") || lowerCategory.includes("ansible")) {
    return "https://upload.wikimedia.org/wikipedia/commons/2/24/Ansible_logo.svg";
  }

  return "https://images.viblo.asia/fad7cf1a-772f-43e4-9042-e96d5d903b2b.png";
};

export const CourseIcon: FC<CourseIconProps> = ({ title, category }) => {
  const courseIcon = getCourseIcon(title, category);

  return (
    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <img
        src={courseIcon}
        alt={title}
        className="h-32 w-32 object-contain"
        onError={(e) => {
          e.currentTarget.src =
            "https://images.viblo.asia/fad7cf1a-772f-43e4-9042-e96d5d903b2b.png";
        }}
      />
    </div>
  );
};
