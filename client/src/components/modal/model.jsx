import React from "react";
import {createPortal} from "react-dom"


import Overlay from "../UI/overlay";
import { Heading } from "lucide-react";
import Headings from "../UI/headings";


export default function Modal({children}){
    return createPortal(
        <Overlay bg={"white"}>
            <Headings>
            <h1> modal</h1>
            </Headings>
            {children}
        </Overlay>,

    document.body
    )
}