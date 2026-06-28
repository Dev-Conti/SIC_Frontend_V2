"use client";

import withAuth from "@/hoc/withAuth";
import Home from "./page";

const ClientProtectedPage = withAuth(Home);

export default ClientProtectedPage;