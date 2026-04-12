import type { Component } from "react"

interface IComponent {
    id: number
    name: string
    y_pos: number
    x_pos: number
    height: number
    width: number
}


export type GetComponents = IComponent[] 

export type GetComponent = IComponent 


const BASE_URL = "http://localhost:8000";



export async function CustomApiRequest<T>(endpoint: string, data: any | null, method: string) : Promise<T>
{
    const response = await fetch(
       `${BASE_URL}/${endpoint}`,
        {
            method: method,
            headers: {'Content-Type': 'application/json'},
            ...(data && {body: JSON.stringify(data)})
        }
    )
    const result = await response.json();
    if(!response.ok)
    {
        throw new Error(result.message);
    }
    return (result) as T;
}
