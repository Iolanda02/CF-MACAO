import protectedApi from "./protectedApi";
import publicApi from "./publicApi";

export async function registerApi(body) {
    try {
        const response = await publicApi.post('/auth/register', body, {
            headers: { 
                "Content-Type": "application/json"
            }   
        });
        // console.log("(API) - register: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function loginAPi(body) {
    try {
        const response = await publicApi.post('/auth/login', body);
        // console.log("(API) - login: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function profile() {
    try {
        const response = await protectedApi.get('/auth/profile');
        // console.log("(API) - profile: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}