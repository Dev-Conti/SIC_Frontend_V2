import React from 'react';
import withAuth from "@/hoc/withAuth";
import Home from "./page";

const AuthenticatedHome = withAuth(Home);

export default AuthenticatedHome;