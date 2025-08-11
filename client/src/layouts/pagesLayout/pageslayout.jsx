import React from "react";
import { Outlet } from "react-router";

import Navbar from "../../components/navBar/navbar";
import Main from "../../UI/Main";

const PagesLayout = () => {
  return (
    <>
    <Navbar />
    <Main>
        <Outlet />
    </Main>
    </>
  );
};

export default PagesLayout;
