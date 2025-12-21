import { FC } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "@/app/layout";
import {
  Home,
  NoMatch,
  CoursesListPage,
  CourseDetailPage,
  Login,
  SubjectListPage,
} from "@/pages";
import { Lab, StartLab } from "@/pages/lab";
import ProtectedRoute from "./layout/ui/ProtectedRoute";
import { HistoryDetailPage, HistoryListPage } from "@/pages/history";
import LabSetup from "@/pages/lab/ui/page/lab-setup";

const App: FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses"
            element={
              <ProtectedRoute>
                <CoursesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="subject"
            element={
              <ProtectedRoute>
                <SubjectListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute>
                <HistoryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="history/:sessionId"
            element={
              <ProtectedRoute>
                <HistoryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NoMatch />} />
        </Route>

        <Route
          path="courses/:courseId/labs/:labId/start"
          element={
            <ProtectedRoute>
              <StartLab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/labs/:labId/setup/:sessionId"
          element={
            <ProtectedRoute>
              <LabSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labs/:labId/:sessionId"
          element={
            <ProtectedRoute>
              <Lab />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
