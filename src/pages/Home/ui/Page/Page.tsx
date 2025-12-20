import { FC } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Rocket, Code, Cloud, GitBranch } from "lucide-react";

const Home: FC = () => {
  return (
    <>
      <section>
        <div className="hero min-h-[calc(100vh-64px)] bg-gradient-to-br from-base-200 via-base-100 to-base-200">
          <div className="hero-content flex-col gap-8 lg:flex-row-reverse lg:gap-12">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"></div>
              <img
                src="https://images.viblo.asia/e60190b9-574c-4144-9eb0-8d3a54d3cd6a.png"
                className="animate-float relative z-10 max-w-sm drop-shadow-2xl lg:max-w-md"
                alt="DevOps Automation Pipeline"
              />
            </div>

            <div className="max-w-xl space-y-6">
              <div className="badge badge-primary badge-lg gap-2">
                <Rocket className="h-4 w-4" />
                Nền Tảng Học Tập DevOps
              </div>

              <h1 className="text-5xl font-bold leading-tight text-primary lg:text-6xl">
                Làm Chủ Quy Trình DevOps & Cloud-Native
              </h1>

              <p className="text-lg leading-relaxed text-base-content/80">
                Vượt xa lý thuyết. Khám phá các bài lab tương tác, thực hành
                được thiết kế cho các tình huống thực tế. Học cách xây dựng,
                triển khai và quản lý ứng dụng với sự tự tin sử dụng các công
                nghệ như
                <strong className="font-semibold text-primary">
                  {" "}
                  Docker, Git và Linux.
                </strong>
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Code className="h-5 w-5 text-primary" />
                  <span>Thực hành trực tiếp</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Cloud className="h-5 w-5 text-primary" />
                  <span>Môi trường Linux</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="h-5 w-5 text-primary" />
                  <span>Quản lý Git</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Rocket className="h-5 w-5 text-primary" />
                  <span>Container hóa</span>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Link
                  to="/courses"
                  className="btn btn-primary btn-lg gap-2 shadow-lg transition-all hover:shadow-primary/50"
                >
                  Khám Phá Khóa Học
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link to="/about" className="btn btn-outline btn-lg gap-2">
                  Tìm Hiểu Thêm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Home;
