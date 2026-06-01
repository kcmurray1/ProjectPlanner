interface ITask {
    id: number
    title: string
    status: string
    description: string
}

interface IComponent {
    id: number
    name: string
    y_pos: number
    x_pos: number
    height: number
    width: number
    type: string
    group_id: number
    parent_id: string
    tasks: ITask[]
}

// {
//     parentId?: string | undefined;
//     extent?: "parent" | null | undefined;
//     id: string;
//     data: {
//         label: string;
//     };
//     position: {
//         x: number;
//         y: number;
//     };
//     type: string;
//     width: number;
//     height: number;


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
