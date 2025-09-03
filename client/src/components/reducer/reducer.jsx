import React, { useReducer } from "react";

const reducer = (state, action)=>{
    switch(action.type){
        case "increment":
            return state + action.payload;
        case "decrement":
            return state - action.payload;
    }
}

export function ReducerLearning(){
    const [count, dispatch] = useReducer(reducer, 0)
    return(
        <div>
            <h1>{count}</h1>
            <button onClick={dispatch({type:"increment", payload: 1})}> +</button>
            <button onClick={dispatch({type: "decrement", payload: 1})}> - </button>

        </div>
    )
}