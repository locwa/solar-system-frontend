import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import "./index.css"
import { DashboardTemplate } from "./templates/DashboardTemplate.tsx";
import { Login } from "./pages/Login.tsx";
import { Home } from "./pages/Home.tsx";
import { Planets } from "./pages/Planets.tsx";
import { PlanetDetails } from "./pages/PlanetDetails.tsx";
import { CreatePlanet } from "./pages/CreatePlanet.tsx";
import { AssignLeader } from "./pages/AssignLeader.tsx";
import { PlanetaryLeaders } from "./pages/PlanetaryLeaders.tsx";
import { ManagedPlanetDetails } from "./pages/ManagedPlanetDetails.tsx";
import { SubmitModificationRequest } from "./pages/SubmitModificationRequest.tsx";
import { CitizensOnPlanet } from "./pages/CitizensOnPlanet.tsx";
import { CitizenDetails } from "./pages/CitizenDetails.tsx";
import { CreateCitizen } from "./pages/CreateCitizen.tsx";
import { CitizenProfile } from "./pages/CitizenProfile.tsx";
import { ModificationRequestDetails } from "./pages/ModificationRequestDetails.tsx";
import { Vote } from "./pages/Vote.tsx";
import { CitizenshipRequests } from "./pages/CitizenshipRequests.tsx";
import { Proposals } from "./pages/Proposals.tsx";
import { IncomingCitizenshipRequests } from "./pages/IncomingCitizenshipRequests.tsx";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";

const PrivateRoute = ({ children, requiredRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
          <Routes>
              <Route path="/login" element={<Login/>}/>
              <Route path="/" element={<PrivateRoute><DashboardTemplate><Home /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/home" element={<PrivateRoute><DashboardTemplate><Home /></DashboardTemplate></PrivateRoute>}/>
              
              {/* All roles can view planets */}
              <Route path="/planets" element={<PrivateRoute requiredRoles={["Galactic Leader", "Planetary Leader", "Citizen"]}><DashboardTemplate><Planets /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/planets/:planetId" element={<PrivateRoute requiredRoles={["Galactic Leader", "Planetary Leader", "Citizen"]}><DashboardTemplate><PlanetDetails /></DashboardTemplate></PrivateRoute>}/>
              
              {/* Galactic Leader routes */}
              <Route path="/planets/create" element={<PrivateRoute requiredRoles={["Galactic Leader"]}><DashboardTemplate><CreatePlanet /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/planets/:planetId/assign-leader" element={<PrivateRoute requiredRoles={["Galactic Leader"]}><DashboardTemplate><AssignLeader /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/planetary-leaders" element={<PrivateRoute requiredRoles={["Galactic Leader"]}><DashboardTemplate><PlanetaryLeaders /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/proposals" element={<PrivateRoute requiredRoles={["Galactic Leader"]}><DashboardTemplate><Proposals /></DashboardTemplate></PrivateRoute>}/>
              
              {/* Planetary Leader routes */}
              <Route path="/planets/:planetId/managed-details" element={<PrivateRoute requiredRoles={["Planetary Leader"]}><DashboardTemplate><ManagedPlanetDetails /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/planets/:planetId/submit-request" element={<PrivateRoute requiredRoles={["Planetary Leader"]}><DashboardTemplate><SubmitModificationRequest /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/planets/:planetId/citizens" element={<PrivateRoute requiredRoles={["Planetary Leader"]}><DashboardTemplate><CitizensOnPlanet /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/planets/:planetId/citizens/create" element={<PrivateRoute requiredRoles={["Planetary Leader"]}><DashboardTemplate><CreateCitizen /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/planets/:planetId/citizenship-requests" element={<PrivateRoute requiredRoles={["Planetary Leader"]}><DashboardTemplate><IncomingCitizenshipRequests /></DashboardTemplate></PrivateRoute>}/>
              
              {/* Citizen routes */}
              <Route path="/citizens/:citizenId" element={<PrivateRoute requiredRoles={["Planetary Leader", "Citizen"]}><DashboardTemplate><CitizenDetails /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/citizens/:citizenId/profile" element={<PrivateRoute requiredRoles={["Citizen"]}><DashboardTemplate><CitizenProfile /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/planets/:planetId/modification-requests/:requestId" element={<PrivateRoute requiredRoles={["Citizen"]}><DashboardTemplate><ModificationRequestDetails /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/votes" element={<PrivateRoute requiredRoles={["Citizen"]}><DashboardTemplate><Vote /></DashboardTemplate></PrivateRoute>}/>
              <Route path="/citizenship-requests" element={<PrivateRoute requiredRoles={["Citizen"]}><DashboardTemplate><CitizenshipRequests /></DashboardTemplate></PrivateRoute>}/>
              
              <Route path="/unauthorized" element={<div className="p-6 text-center"><h1 className="text-2xl font-bold text-red-600">Unauthorized</h1><p>You do not have permission to view this page.</p></div>} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
