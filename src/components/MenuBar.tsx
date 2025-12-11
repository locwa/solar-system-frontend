import { NavLink, useNavigate } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/AuthContext.tsx";
import React from "react";

export function MenuBar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    library.add(fas);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    if (!user) {
        return null;
    }

    return (
        <div className="w-[22vw] h-[100vh] bg-[#2c3e50] text-white sticky top-0 h-screen">
            <h2 className="text-3xl text-center py-6 font-semibold">Solar System Management</h2>
            <hr/>
            <ul className="py-6 px-4">
                <li className="py-3">
                    <NavLink to="/home" className="w-[100%] text-left flex items-center">
                        <FontAwesomeIcon icon={["fas", "home"]} className="pr-3"/>Home
                    </NavLink>
                </li>

                {(user.role === "Galactic Leader" || user.role === "Planetary Leader" || user.role === "Citizen") && (
                    <li className="py-3">
                        <NavLink to="/planets" className="w-[100%] text-left flex items-center">
                            <FontAwesomeIcon icon={["fas", "earth-asia"]} className="pr-3"/> Planets
                        </NavLink>
                    </li>
                )}

                {user.role === "Galactic Leader" && (
                    <>
                        <li className="py-3">
                            <NavLink to="/planetary-leaders" className="w-[100%] text-left flex items-center">
                                <FontAwesomeIcon icon={["fas", "users"]} className="pr-3"/> Planetary Leaders
                            </NavLink>
                        </li>
                        <li className="py-3">
                            <NavLink to="/proposals" className="w-[100%] text-left flex items-center">
                                <FontAwesomeIcon icon={["fas", "file-alt"]} className="pr-3"/> Review Proposals
                            </NavLink>
                        </li>
                    </>
                )}

                {user.role === "Citizen" && (
                    <>
                        <li className="py-3">
                            <NavLink to="/votes" className="w-[100%] text-left flex items-center">
                                <FontAwesomeIcon icon={["fas", "check-to-slot"]} className="pr-3"/>Vote on Proposals
                            </NavLink>
                        </li>
                        <li className="py-3">
                            <NavLink to="/citizenship-requests" className="w-[100%] text-left flex items-center">
                                <FontAwesomeIcon icon={["fas", "hand-holding-medical"]} className="pr-3"/>Citizenship Requests
                            </NavLink>
                        </li>
                    </>
                )}
                
                <li className="py-3">
                    <button
                        onClick={handleLogout}
                        className="w-[100%] text-left hover:cursor-pointer flex items-center">
                        <FontAwesomeIcon icon={["fas", "sign-out-alt"]} className="pr-3"/> Logout
                    </button>
                </li>
            </ul>
        </div>
    );
}
